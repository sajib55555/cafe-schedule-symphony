import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { StaffProvider } from "./contexts/StaffContext";
import { Toaster } from "@/components/ui/toaster";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { useAuth } from "./contexts/AuthContext";
import LandingPage from "./pages/LandingPage";
import Auth from "./pages/Auth";
import Settings from "./pages/Settings";
import WagesAnalysis from "./pages/WagesAnalysis";
import Tasks from "./pages/Tasks";
import Dashboard from "./pages/Dashboard";
import { EmployeeList } from "./components/EmployeeList";

function AppRoutes() {
  const { session, hasAccess, trialEnded } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth/*" element={<Auth />} />
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
        path="/wages"
        element={
          <ProtectedRoute session={session} hasAccess={hasAccess} trialEnded={trialEnded}>
            <WagesAnalysis />
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
      <Route
        path="/staff"
        element={
          <ProtectedRoute session={session} hasAccess={hasAccess} trialEnded={trialEnded}>
            <div className="container mx-auto py-6">
              <EmployeeList />
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
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