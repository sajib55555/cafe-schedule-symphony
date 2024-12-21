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

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { loading, hasAccess, session, trialEnded } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute session={session} hasAccess={hasAccess} trialEnded={trialEnded}>
            <Index />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/auth" 
        element={
          session ? (
            hasAccess ? (
              <Navigate to="/" replace />
            ) : (
              <Navigate to="/upgrade" replace />
            )
          ) : (
            <Auth />
          )
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
              <Navigate to="/" replace />
            ) : (
              <UpgradePage />
            )
          ) : (
            <Navigate to="/auth" replace />
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