import { Navigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactElement;
}) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}
