import { Alert, Typography } from "@mui/material";

export default function ReportsPage() {
  return (
    <>
      <Typography variant="h4" gutterBottom>
        Reports
      </Typography>
      <Alert severity="info">
        Reporting exports and compliance views are planned for the next phase.
      </Alert>
    </>
  );
}
