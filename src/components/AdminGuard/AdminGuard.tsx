import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

function AdminGuard({ children }: Props) {
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const currentUser = useAppSelector((state) => state.auth.user);

  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (currentUser?.role !== "ADMIN") return <Navigate to="/" replace />;

  return <>{children}</>;
}

export default AdminGuard;
