import {
  AppBar,
  Box,
  Button,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

const drawerWidth = 250;
const links = [
  { label: "Dashboard", path: "/" },
  { label: "Certificates", path: "/certificates" },
  { label: "Order New Certificate", path: "/certificates/new" },
  { label: "External DigiCert Inventory", path: "/external-digicert" },
  { label: "Exceptions", path: "/exceptions" },
  { label: "Reports", path: "/reports" },
  { label: "Jobs", path: "/jobs" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed" sx={{ zIndex: 1201 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Certificate Automation
          </Typography>
          <Typography sx={{ marginRight: 2 }}>
            {user?.username} ({user?.role})
          </Typography>
          <Button color="inherit" onClick={logout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
          },
        }}
      >
        <Toolbar />
        <List>
          {links.filter((link) => link.path !== "/certificates/new" || user?.role !== "Viewer").map((link) => (
            <ListItemButton
              key={link.path}
              component={Link}
              to={link.path}
              selected={location.pathname === link.path}
            >
              <ListItemText primary={link.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          marginLeft: `${drawerWidth}px`,
          padding: 3,
          width: "100%",
          backgroundColor: "#f5f7fb",
          minHeight: "100vh",
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
