import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { StaffProvider } from "@/contexts/StaffContext";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Settings from "@/pages/Settings";
import WagesAnalysis from "@/pages/WagesAnalysis";
import HolidayTracking from "@/pages/HolidayTracking";
import Tasks from "@/pages/Tasks";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

function AppRoutes() {
  const { session, hasAccess, trialEnded } = useAuth();

  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route
        path="/"
        element={
          <ProtectedRoute session={session} hasAccess={hasAccess} trialEnded={trialEnded}>
            <Index />
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
        path="/wages"
        element={
          <ProtectedRoute session={session} hasAccess={hasAccess} trialEnded={trialEnded}>
            <WagesAnalysis />
          </ProtectedRoute>
        }
      />
      <Route
        path="/holiday"
        element={
          <ProtectedRoute session={session} hasAccess={hasAccess} trialEnded={trialEnded}>
            <HolidayTracking />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute session={session} hasAccess={hasAccess} trialEnded={trialEnded}>
            <Tasks />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <StaffProvider>
          <AppRoutes />
          <Toaster />
        </StaffProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;