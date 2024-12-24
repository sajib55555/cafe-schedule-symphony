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
    console.log('No session, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // If trial has ended, redirect to upgrade
  if (trialEnded) {
    console.log('Trial ended, redirecting to upgrade');
    return <Navigate to="/upgrade" replace />;
  }

  // If no access, redirect to upgrade
  if (!hasAccess) {
    console.log('No access, redirecting to upgrade');
    return <Navigate to="/upgrade" replace />;
  }

  console.log('All checks passed, rendering layout with children');
  // If all checks pass, render the layout with children
  return <Layout>{children}</Layout>;
};