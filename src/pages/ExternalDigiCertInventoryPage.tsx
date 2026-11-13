import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";

import { apiClient } from "../api/client";
import type { ExternalCertificate } from "../types";

export default function ExternalDigiCertInventoryPage() {
  const [commonName, setCommonName] = useState("");

  const query = useQuery({
    queryKey: ["external-digicert", commonName],
    queryFn: async () => {
      const response = await apiClient.get<ExternalCertificate[]>(
        "/external/digicert",
        {
          params: {
            common_name: commonName || undefined,
          },
        },
      );
      return response.data;
    },
  });

  return (
    <Card>
      <CardContent>
        <Typography variant="h4">External DigiCert Inventory</Typography>
        <TextField
          sx={{ marginY: 2 }}
          label="Common name"
          value={commonName}
          onChange={(event) => setCommonName(event.target.value)}
        />

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Common name</TableCell>
              <TableCell>Order ID</TableCell>
              <TableCell>Expires</TableCell>
              <TableCell>Management state</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {query.data?.map((certificate) => (
              <TableRow key={certificate.order_id}>
                <TableCell>{certificate.common_name}</TableCell>
                <TableCell>{certificate.order_id}</TableCell>
                <TableCell>{certificate.valid_till}</TableCell>
                <TableCell>
                  <Chip
                    color={
                      certificate.management_state === "Managed"
                        ? "success"
                        : "default"
                    }
                    label={certificate.management_state}
                  />
                </TableCell>
                <TableCell>
                  <Stack direction="row">
                    <Button
                      component={Link}
                      to={`/external-digicert/${certificate.order_id}`}
                    >
                      Details
                    </Button>
                    {certificate.local_certificate_id && (
                      <Button
                        component={Link}
                        to={`/certificates/${certificate.local_certificate_id}`}
                      >
                        Open Managed
                      </Button>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
