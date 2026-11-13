import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";

import { apiClient } from "../api/client";
import type { Certificate } from "../types";

export default function CertificatesPage() {
  const query = useQuery({
    queryKey: ["certificates"],
    queryFn: async () => {
      const response = await apiClient.get<Certificate[]>("/certificates");
      return response.data;
    },
  });

  return (
    <Card>
      <CardContent>
        <Typography variant="h4">Certificates</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Common name</TableCell>
              <TableCell>Management state</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {query.data?.map((certificate) => (
              <TableRow key={certificate.id}>
                <TableCell>{certificate.common_name}</TableCell>
                <TableCell>
                  <Chip label={certificate.management_state} />
                </TableCell>
                <TableCell>{certificate.status}</TableCell>
                <TableCell>
                  <Button
                    component={Link}
                    to={`/certificates/${certificate.id}`}
                  >
                    Open
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
