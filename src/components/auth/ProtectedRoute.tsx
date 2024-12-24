import { Navigate } from "react-router-dom";
import { Layout } from "../Layout";

interface ProtectedRouteProps {
  session: any;
  hasAccess: boolean;
  trialEnded: boolean;
  children: React.ReactNode;
}

export const ProtectedRoute = ({
  session,
  hasAccess,
  trialEnded,
  children,
}: ProtectedRouteProps) => {
  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  if (trialEnded) {
    return <Navigate to="/upgrade" replace />;
  }

  if (!hasAccess) {
    return <Navigate to="/upgrade" replace />;
  }

  return <Layout>{children}</Layout>;
};