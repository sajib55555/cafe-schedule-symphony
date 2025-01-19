import { Navigate } from "react-router-dom";

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
    return <Navigate to="/" replace />;
  }

  if (trialEnded && !hasAccess) {
    return <Navigate to="/upgrade" replace />;
  }

  return children;
};