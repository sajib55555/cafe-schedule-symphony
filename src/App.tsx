import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { StaffProvider } from "./contexts/StaffContext";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Subscription from "./pages/Subscription";
import UpgradePage from "./pages/UpgradePage";
import Auth from "./pages/Auth";
import WagesAnalysis from "./pages/WagesAnalysis";
import Settings from "./pages/Settings";
import LandingPage from "./pages/LandingPage";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { loading, hasAccess, session, trialEnded } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Loading...</div>
    </div>;
  }

  return (
    <Routes>
      <Route path="/landing" element={<LandingPage />} />
      <Route 
        path="/" 
        element={
          session ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/auth" replace />
          )
        } 
      />
      <Route path="/auth" element={
        session ? (
          <Navigate to="/dashboard" replace />
        ) : (
          <Auth />
        )
      } />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute session={session} hasAccess={hasAccess} trialEnded={trialEnded}>
            <Index />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wages"
        element={
          <ProtectedRoute session={session} hasAccess={hasAccess} trialEnded={trialEnded}>
            <WagesAnalysis />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/subscription" 
        element={
          session ? (
            <Subscription />
          ) : (
            <Navigate to="/auth" replace />
          )
        } 
      />
      <Route 
        path="/upgrade" 
        element={
          session ? (
            hasAccess ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <UpgradePage />
            )
          ) : (
            <Navigate to="/auth" replace />
          )
        } 
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute session={session} hasAccess={hasAccess} trialEnded={trialEnded}>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route 
        path="*" 
        element={
          <Navigate to={session ? "/dashboard" : "/auth"} replace />
        } 
      />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <BrowserRouter>
            <StaffProvider>
              <Toaster />
              <Sonner />
              <AppRoutes />
            </StaffProvider>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;