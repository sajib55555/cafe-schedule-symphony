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
  // If there's no session, redirect to auth
  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  // If trial has ended, redirect to upgrade
  if (trialEnded) {
    return <Navigate to="/upgrade" replace />;
  }

  // If no access, redirect to upgrade
  if (!hasAccess) {
    return <Navigate to="/upgrade" replace />;
  }

  // If all checks pass, render the layout with children
  return <Layout>{children}</Layout>;
};