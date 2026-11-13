import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { apiClient } from "../api/client";
import type { Job } from "../types";

export default function JobsPage() {
  const query = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const response = await apiClient.get<Job[]>("/jobs");
      return response.data;
    },
  });

  return (
    <Card>
      <CardContent>
        <Typography variant="h4">Jobs</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actor</TableCell>
              <TableCell>Message</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {query.data?.map((job) => (
              <TableRow key={job.id}>
                <TableCell>{job.job_type}</TableCell>
                <TableCell>{job.status}</TableCell>
                <TableCell>{job.actor}</TableCell>
                <TableCell>{job.message}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
