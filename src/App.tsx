import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { StaffProvider } from "./contexts/StaffContext";
import { Toaster } from "@/components/ui/toaster";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { useAuth } from "./contexts/AuthContext";
import { Layout } from "./components/Layout";
import LandingPage from "./pages/LandingPage";
import Auth from "./pages/Auth";
import Settings from "./pages/Settings";
import WagesAnalysis from "./pages/WagesAnalysis";
import Tasks from "./pages/Tasks";
import Dashboard from "./pages/Dashboard";
import HolidayTracking from "./pages/HolidayTracking";
import { EmployeeList } from "./components/EmployeeList";
import AIHRAdvisor from "./pages/AIHRAdvisor";

function AppRoutes() {
  const { session, hasAccess, trialEnded } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<Auth />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute session={session} hasAccess={hasAccess} trialEnded={trialEnded}>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute session={session} hasAccess={hasAccess} trialEnded={trialEnded}>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/wages"
        element={
          <ProtectedRoute session={session} hasAccess={hasAccess} trialEnded={trialEnded}>
            <Layout>
              <WagesAnalysis />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute session={session} hasAccess={hasAccess} trialEnded={trialEnded}>
            <Layout>
              <Tasks />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/holiday"
        element={
          <ProtectedRoute session={session} hasAccess={hasAccess} trialEnded={trialEnded}>
            <Layout>
              <HolidayTracking />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff"
        element={
          <ProtectedRoute session={session} hasAccess={hasAccess} trialEnded={trialEnded}>
            <Layout>
              <div className="container mx-auto py-6">
                <EmployeeList />
              </div>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr-advisor"
        element={
          <ProtectedRoute session={session} hasAccess={hasAccess} trialEnded={trialEnded}>
            <Layout>
              <AIHRAdvisor />
            </Layout>
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