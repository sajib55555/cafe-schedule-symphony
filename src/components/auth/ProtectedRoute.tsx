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

  if (!session) {
    console.log('No session, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  if (trialEnded) {
    console.log('Trial ended, redirecting to upgrade');
    return <Navigate to="/upgrade" replace />;
  }

  if (!hasAccess) {
    console.log('No access, redirecting to upgrade');
    return <Navigate to="/upgrade" replace />;
  }

  return <Layout>{children}</Layout>;
};