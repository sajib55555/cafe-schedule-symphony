import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import Settings from "@/pages/Settings";
import Subscription from "@/pages/Subscription";
import UpgradePage from "@/pages/UpgradePage";
import WagesAnalysis from "@/pages/WagesAnalysis";
import { useAuth } from "@/contexts/AuthContext";
import Dashboard from "@/pages/Dashboard";

export const AppRoutes = () => {
  const { session, hasAccess = true, trialEnded = false } = useAuth();

  return (
    <Routes>
      <Route path="/auth" element={
        session ? <Navigate to="/dashboard" replace /> : <Auth />
      } />
      <Route
        path="/"
        element={
          <ProtectedRoute session={session} hasAccess={hasAccess} trialEnded={trialEnded}>
            <Navigate to="/dashboard" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute session={session} hasAccess={hasAccess} trialEnded={trialEnded}>
            <Dashboard />
          </ProtectedRoute>
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
        path="/subscription"
        element={
          <ProtectedRoute session={session} hasAccess={hasAccess} trialEnded={trialEnded}>
            <Subscription />
          </ProtectedRoute>
        }
      />
      <Route
        path="/upgrade"
        element={
          <ProtectedRoute session={session} hasAccess={hasAccess} trialEnded={trialEnded}>
            <UpgradePage />
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
    </Routes>
  );
};