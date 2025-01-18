import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { StaffProvider } from "./contexts/StaffContext";
import { Toaster } from "@/components/ui/toaster";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { LandingPage } from "./pages/LandingPage";
import { Auth } from "./pages/Auth";
import { Settings } from "./pages/Settings";
import { WagesAnalysis } from "./pages/WagesAnalysis";
import { Tasks } from "./pages/Tasks";
import { EmployeeList } from "./components/EmployeeList";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth/*" element={<Auth />} />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wages"
        element={
          <ProtectedRoute>
            <WagesAnalysis />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff"
        element={
          <ProtectedRoute>
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