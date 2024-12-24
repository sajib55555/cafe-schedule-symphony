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

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { loading, hasAccess, session, trialEnded } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Auth />} />
      <Route
        path="/dashboard"
        element={
          session ? (
            <Index />
          ) : (
            <Navigate to="/" replace />
          )
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
            <Navigate to="/" replace />
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
            <Navigate to="/" replace />
          )
        } 
      />
      <Route
        path="/settings"
        element={
          session ? (
            <Settings />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <StaffProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </StaffProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;