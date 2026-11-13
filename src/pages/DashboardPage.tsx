import { useQuery } from "@tanstack/react-query";
import { Box, Card, CardContent, Typography } from "@mui/material";

import { apiClient } from "../api/client";
import type { DashboardMetrics } from "../types";

export default function DashboardPage() {
  const query = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const response = await apiClient.get<DashboardMetrics>("/dashboard");
      return response.data;
    },
  });

  const metrics = query.data;
  if (!metrics) {
    return <Typography>Loading dashboard...</Typography>;
  }

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 2,
        }}
      >
        {Object.entries(metrics).map(([name, value]) => (
          <Card key={name}>
            <CardContent>
              <Typography color="text.secondary">{name}</Typography>
              <Typography variant="h4">{value}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </>
  );
}
