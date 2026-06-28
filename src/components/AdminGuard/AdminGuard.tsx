import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

function AdminGuard({ children }: Props) {
  const { isLoggedIn, currentUser } = useAuth();

  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (currentUser?.role !== "ADMIN") return <Navigate to="/" replace />;

  return <>{children}</>;
}

export default AdminGuard;
