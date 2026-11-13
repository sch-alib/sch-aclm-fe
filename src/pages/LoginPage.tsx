import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from "@mui/material";
import { Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { user, login } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function handleLogin() {
    await login(username, password);
    navigate("/");
  }

  return (
    <Box sx={{ maxWidth: 420, margin: "10% auto" }}>
      <Card>
        <CardContent>
          <Typography variant="h5">Login</Typography>
          <TextField
            fullWidth
            margin="normal"
            label="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Button variant="contained" onClick={handleLogin}>
            Login
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
