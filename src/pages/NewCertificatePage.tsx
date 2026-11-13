import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Alert, Button, Card, CardContent, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { apiClient, getApiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import type { Certificate } from "../types";

type OrderDefaults = {
  product_name_id: string;
  organization_id: number | null;
  validity_days: number;
};

export default function NewCertificatePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [commonName, setCommonName] = useState("");
  const [sans, setSans] = useState("");
  const [csr, setCsr] = useState("");
  const [product, setProduct] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [validity, setValidity] = useState("");
  const defaults = useQuery({
    queryKey: ["order-defaults"],
    queryFn: async () => (await apiClient.get<OrderDefaults>("/certificates/order-defaults")).data,
  });
  // Defaults remain editable; do not reset edits if the query refetches.
  const chosenProduct = product || defaults.data?.product_name_id || "ssl_plus";
  const chosenOrganization = organizationId || String(defaults.data?.organization_id ?? "");
  const chosenValidity = validity || String(defaults.data?.validity_days ?? 199);

  const order = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<Certificate>("/certificates", {
        common_name: commonName.trim(),
        dns_names: sans.split(/[\n,]/).map((name) => name.trim()).filter(Boolean),
        csr_pem: csr.trim(),
        product_name_id: chosenProduct,
        organization_id: Number(chosenOrganization),
        validity_days: Number(chosenValidity),
      });
      return response.data;
    },
    onSuccess: (certificate) => navigate(`/certificates/${certificate.id}`),
  });

  if (user?.role === "Viewer") {
    return <Alert severity="error">Only Admins and Operators can place orders.</Alert>;
  }

  return (
    <Card sx={{ maxWidth: 760 }}>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h4">Order a new certificate</Typography>
          <Alert severity="warning">
            This places a new DigiCert order, which may incur a charge and require approval.
            Keep the CSR's private key securely on the system where it was generated.
            Issuance is checked separately; this action does not deploy a certificate.
          </Alert>
          <TextField label="Common name" value={commonName} required
            onChange={(event) => setCommonName(event.target.value)} />
          <TextField label="SANs (comma or newline separated)" value={sans} multiline rows={2}
            onChange={(event) => setSans(event.target.value)} />
          <TextField select label="DigiCert product" value={chosenProduct}
            onChange={(event) => setProduct(event.target.value)}>
            <MenuItem value="ssl_plus">Standard SSL (ssl_plus)</MenuItem>
            <MenuItem value="ssl_multi_domain">Multi-domain SSL (ssl_multi_domain)</MenuItem>
            <MenuItem value="ssl_wildcard">Wildcard SSL (ssl_wildcard)</MenuItem>
          </TextField>
          <TextField label="DigiCert organization ID" type="number" required
            helperText="Use the ID of an existing validated CertCentral organization."
            value={chosenOrganization}
            onChange={(event) => setOrganizationId(event.target.value)} />
          <TextField label="Order validity (days)" type="number" required
            slotProps={{ htmlInput: { min: 1, max: 199 } }} value={chosenValidity}
            onChange={(event) => setValidity(event.target.value)} />
          <TextField label="Paste PEM CSR" value={csr} required multiline minRows={5}
            onChange={(event) => setCsr(event.target.value)} />
          <Button component="label" variant="outlined">
            Upload CSR file
            <input type="file" accept=".csr,.pem,.txt" hidden
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (file) setCsr(await file.text());
              }} />
          </Button>
          {defaults.isError && <Alert severity="error">{getApiError(defaults.error)}</Alert>}
          {order.isError && <Alert severity="error">{getApiError(order.error)}</Alert>}
          <Button variant="contained" disabled={order.isPending || !commonName.trim() || !csr.trim() ||
            !chosenOrganization || !chosenValidity || defaults.isLoading}
            onClick={() => order.mutate()}>
            {order.isPending ? "Submitting order…" : "Submit DigiCert order"}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
