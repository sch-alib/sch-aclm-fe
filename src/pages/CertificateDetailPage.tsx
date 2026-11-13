import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert, Button, Card, CardContent, Chip, Dialog, DialogActions,
  DialogContent, DialogTitle, List, ListItem, ListItemText, Stack,
  TextField, Typography,
} from "@mui/material";
import { Link, useParams } from "react-router-dom";

import { apiClient, getApiError } from "../api/client";
import CertificateMetadata from "../components/CertificateMetadata";
import { useAuth } from "../auth/AuthContext";
import type { CertificateDetails, ExternalDetails } from "../types";

export default function CertificateDetailPage() {
  const { certificateId } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [offboardOpen, setOffboardOpen] = useState(false);
  const [reason, setReason] = useState("");

  const query = useQuery({
    queryKey: ["certificate", certificateId],
    refetchInterval: (query) => query.state.data?.management_state === "Pending issuance" ? 15000 : false,
    queryFn: async () => {
      const response = await apiClient.get<CertificateDetails>(`/certificates/${certificateId}`);
      return response.data;
    },
  });
  const orderId = query.data?.external_order_id;
  const digiCertQuery = useQuery({
    queryKey: ["external-detail", orderId],
    enabled: query.data?.ca_type === "digicert" && Boolean(orderId),
    retry: 1,
    queryFn: async () => {
      const response = await apiClient.get<ExternalDetails>(
        `/external/digicert/${encodeURIComponent(orderId!)}`,
      );
      return response.data;
    },
  });
  const renewal = useMutation({
    mutationFn: async () => apiClient.post(`/certificates/${certificateId}/renew`),
    onSuccess: async () => { await queryClient.invalidateQueries(); },
  });
  const offboard = useMutation({
    mutationFn: async () => apiClient.post(`/certificates/${certificateId}/offboard`, { reason }),
    onSuccess: async () => {
      setOffboardOpen(false);
      await queryClient.invalidateQueries();
    },
  });
  const issuance = useMutation({
    mutationFn: async () => apiClient.post(`/certificates/${certificateId}/check-issuance`),
    onSettled: async () => { await queryClient.invalidateQueries(); },
  });

  if (query.isError) return <Alert severity="error">{getApiError(query.error)}</Alert>;
  if (!query.data) return <Typography>Loading certificate...</Typography>;
  const certificate = query.data;
  const canManage = user?.role === "Admin" || user?.role === "Operator";

  return (
    <Stack spacing={2}>
      <Card>
        <CardContent>
          <Typography variant="h4">{certificate.common_name}</Typography>
          <Chip label={certificate.management_state} />
          {digiCertQuery.isPending && digiCertQuery.fetchStatus === "fetching" && (
            <Alert severity="info" sx={{ mt: 2 }}>Loading current DigiCert certificate details…</Alert>
          )}
          {digiCertQuery.isError && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Could not load current DigiCert details: {getApiError(digiCertQuery.error)}.
              Showing locally stored values where available.
            </Alert>
          )}
          <CertificateMetadata
            external={digiCertQuery.data?.external}
            local={certificate}
            orderId={certificate.external_order_id ?? undefined}
          />
          <Stack direction="row" spacing={1} sx={{ marginTop: 2 }}>
            {certificate.management_state === "Pending issuance" && canManage && (
              <Button variant="contained" disabled={issuance.isPending || certificate.status === "Rejected"}
                onClick={() => issuance.mutate()}>
                {issuance.isPending ? "Checking…" : certificate.issuance_check?.status === "Needs attention"
                  ? "Retry issuance check" : "Check now"}
              </Button>
            )}
            {certificate.management_state === "Managed" && canManage && (
              <>
                <Button variant="contained"
                  disabled={renewal.isPending || !certificate.renewal_available ||
                    !certificate.targets.some((target) => target.enabled)}
                  onClick={() => renewal.mutate()}>
                  Renew and Deploy
                </Button>
                <Button color="warning" variant="outlined" onClick={() => setOffboardOpen(true)}>
                  Offboard from Automation
                </Button>
              </>
            )}
            {certificate.management_state === "Offboarded" && canManage && certificate.external_order_id && (
              <Button component={Link} to={`/external-digicert/${certificate.external_order_id}`}>
                Re-onboard for Automation
              </Button>
            )}
          </Stack>
          {certificate.management_state === "Pending issuance" && (
            <Alert severity={certificate.issuance_check?.status === "Needs attention" ? "error" :
              certificate.issuance_check?.last_error ? "warning" : "info"} sx={{ mt: 2 }}>
              <Typography>Approval or validation may still be required in DigiCert.
                The server checks automatically; no deployment occurs on issuance.</Typography>
              <Typography>Check status: {certificate.issuance_check?.status ?? "Not scheduled"}</Typography>
              {certificate.issuance_check?.last_checked_at && (
                <Typography>Last checked: {new Date(certificate.issuance_check.last_checked_at).toLocaleString()}</Typography>
              )}
              {certificate.issuance_check?.next_check_at && (
                <Typography>Next check: {new Date(certificate.issuance_check.next_check_at).toLocaleString()}</Typography>
              )}
              {certificate.issuance_check?.last_error && (
                <Typography>Last error (attempt {certificate.issuance_check.consecutive_failures}):
                  {" "}{certificate.issuance_check.last_error}
                  {certificate.issuance_check.status === "Needs attention" &&
                    " Automatic retries are paused; review and use Retry issuance check."}
                </Typography>
              )}
            </Alert>
          )}
          {certificate.management_state === "Order failed" && (
            <Alert severity="error" sx={{ mt: 2 }}>
              DigiCert order {certificate.status.toLowerCase()}.
              {certificate.issuance_check?.last_error && ` ${certificate.issuance_check.last_error}`}
            </Alert>
          )}
          {certificate.management_state === "Managed" && !certificate.renewal_available && (
            <Alert severity="info" sx={{ mt: 2 }}>
              This order uses an externally generated private key. Renew and Deploy is not available;
              a separate deployment workflow is needed and is not implemented yet.
            </Alert>
          )}
          {certificate.management_state === "Managed" && certificate.targets.length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              No installation target is configured. Ordering does not deploy this certificate;
              deployment requires the matching private key, which is not held here.
            </Alert>
          )}
          {renewal.isError && <Alert severity="error">{getApiError(renewal.error)}</Alert>}
          {issuance.isError && <Alert severity="error">{getApiError(issuance.error)}</Alert>}
          {offboard.isError && <Alert severity="error">{getApiError(offboard.error)}</Alert>}
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Typography variant="h6">Installation targets</Typography>
          <List>
            {certificate.targets.map((target) => (
              <ListItem key={target.id}>
                <ListItemText primary={target.name}
                  secondary={`${target.host} | ${target.site_name} | ${target.hostname}:${target.port} | ${target.enabled ? "Enabled" : "Disabled"}`} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
      <Dialog open={offboardOpen} onClose={() => setOffboardOpen(false)}>
        <DialogTitle>Offboard from Automation</DialogTitle>
        <DialogContent>
          <Alert severity="warning">
            Automation and target configuration will be disabled. This does not revoke the
            certificate in DigiCert or uninstall it from any server. Records and history remain.
          </Alert>
          <TextField fullWidth multiline margin="normal" label="Reason (required)"
            value={reason} onChange={(event) => setReason(event.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOffboardOpen(false)}>Cancel</Button>
          <Button color="warning" disabled={offboard.isPending || reason.trim().length < 5}
            onClick={() => offboard.mutate()}>Confirm offboard</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
