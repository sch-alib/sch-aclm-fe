import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Link, useNavigate, useParams } from "react-router-dom";

import { apiClient, getApiError } from "../api/client";
import CertificateMetadata from "../components/CertificateMetadata";
import { useAuth } from "../auth/AuthContext";
import type { ExternalDetails } from "../types";

export default function ExternalDigiCertDetailPage() {
  const { orderId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [caReissueOpen, setCaReissueOpen] = useState(false);
  const [host, setHost] = useState("");
  const [siteName, setSiteName] = useState("Default Web Site");
  const [reason, setReason] = useState("");
  const [onboardingReason, setOnboardingReason] = useState("");
  const [onboardingCsr, setOnboardingCsr] = useState("");
  const [reissueCsr, setReissueCsr] = useState("");
  const canManage = user?.role === "Admin" || user?.role === "Operator";

  const query = useQuery({
    queryKey: ["external-detail", orderId],
    queryFn: async () => {
      const response = await apiClient.get<ExternalDetails>(
        `/external/digicert/${orderId}`,
      );
      return response.data;
    },
  });

  const details = query.data;
  const external = details?.external as Record<string, any> | undefined;
  const certificate = external?.certificate ?? external;

  const onboarding = useMutation({
    mutationFn: async () => {
      return apiClient.post(`/external/digicert/${orderId}/onboard`, {
        common_name: certificate?.common_name ?? "",
        host,
        site_name: siteName,
        hostname: certificate?.common_name ?? "",
        port: 443,
        csr_pem: onboardingCsr || null,
        reason: onboardingReason,
      });
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries();
      navigate(`/certificates/${response.data.id}`);
    },
  });

  const caOnlyReissue = useMutation({
    mutationFn: async () => {
      return apiClient.post(
        `/external/digicert/${orderId}/ca-only-reissue`,
        {
          common_name: certificate?.common_name ?? "",
          csr_pem: reissueCsr || null,
          reason,
        },
      );
    },
    onSuccess: () => {
      setCaReissueOpen(false);
    },
  });

  if (query.isError) return <Alert severity="error">{getApiError(query.error)}</Alert>;
  if (!details || !certificate) {
    return <Typography>Loading external certificate...</Typography>;
  }

  return (
    <>
      <Card>
        <CardContent>
          <Typography variant="h4">{certificate.common_name ?? external?.common_name ?? "Certificate details"}</Typography>
          <Chip label={details.management_state} />
          <CertificateMetadata external={details.external} orderId={orderId} />

          <Stack direction="row" spacing={1} sx={{ marginTop: 2 }}>
            {details.local_certificate_id ? (
              <Button
                variant="contained"
                component={Link}
                to={`/certificates/${details.local_certificate_id}`}
              >
                Open Managed Certificate
              </Button>
            ) : canManage && (
              <Button variant="contained" onClick={() => setOnboardingOpen(true)}>
                Onboard for Automation
              </Button>
            )}
            {details.management_state === "Offboarded" && canManage && (
              <Button variant="outlined" onClick={() => setOnboardingOpen(true)}>
                Re-onboard for Automation
              </Button>
            )}

            {user?.role === "Admin" && (
              <Button
                color="warning"
                variant="outlined"
                onClick={() => setCaReissueOpen(true)}
              >
                CA-only Reissue
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Dialog open={onboardingOpen} onClose={() => setOnboardingOpen(false)}>
        <DialogTitle>Onboard for Automation</DialogTitle>
        <DialogContent>
          <Alert severity="info">
            This enables a managed certificate and an IIS target. Re-onboarding keeps
            previous targets disabled unless explicitly selected again.
          </Alert>
          <TextField
            fullWidth
            margin="normal"
            label="IIS host"
            value={host}
            onChange={(event) => setHost(event.target.value)}
          />
          <TextField
            fullWidth
            margin="normal"
            label="IIS site name"
            value={siteName}
            onChange={(event) => setSiteName(event.target.value)}
          />
          <TextField fullWidth margin="normal" label="Reason (required)" multiline
            value={onboardingReason} onChange={(event) => setOnboardingReason(event.target.value)} />
          <TextField fullWidth margin="normal" label="CSR (optional, needed for future reissue)" multiline
            value={onboardingCsr} onChange={(event) => setOnboardingCsr(event.target.value)} />
          {onboarding.isError && <Alert severity="error">{getApiError(onboarding.error)}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOnboardingOpen(false)}>Cancel</Button>
          <Button disabled={onboarding.isPending || onboardingReason.trim().length < 5 || !host.trim() || !siteName.trim()}
            onClick={() => onboarding.mutate()}>Onboard</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={caReissueOpen} onClose={() => setCaReissueOpen(false)}>
        <DialogTitle>CA-only Reissue</DialogTitle>
        <DialogContent>
          <Alert severity="warning">
            DigiCert will reissue the certificate, but no target device will be updated.
          </Alert>
          <TextField fullWidth multiline margin="normal" label="CSR for reissue (required in real mode)"
            value={reissueCsr} onChange={(event) => setReissueCsr(event.target.value)} />
          <TextField
            fullWidth
            multiline
            margin="normal"
            label="Required reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
          {caOnlyReissue.isError && <Alert severity="error">{getApiError(caOnlyReissue.error)}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCaReissueOpen(false)}>Cancel</Button>
          <Button
            color="warning"
            disabled={caOnlyReissue.isPending || reason.trim().length < 5 || !reissueCsr.trim()}
            onClick={() => caOnlyReissue.mutate()}
          >
            Reissue CA Only
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
