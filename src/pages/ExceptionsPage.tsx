import { Alert, Typography } from "@mui/material";

export default function ExceptionsPage() {
  return (
    <>
      <Typography variant="h4" gutterBottom>
        Exceptions
      </Typography>
      <Alert severity="success">
        No current exceptions. Failed jobs and policy exceptions will appear here.
      </Alert>
    </>
  );
}
