import { Navigate } from "react-router-dom";
import { Layout } from "../Layout";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  session: any;
  hasAccess: boolean;
  trialEnded: boolean;
  children: React.ReactNode;
}

export const ProtectedRoute = ({
  session,
  hasAccess = true,
  trialEnded = false,
  children,
}: ProtectedRouteProps) => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF6E3] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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

  // If all checks pass, render the layout with children
  return <Layout>{children}</Layout>;
};