import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { StaffProvider } from "@/contexts/StaffContext";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Settings from "@/pages/Settings";
import WagesAnalysis from "@/pages/WagesAnalysis";
import HolidayTracking from "@/pages/HolidayTracking";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function App() {
  return (
    <Router>
      <AuthProvider>
        <StaffProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
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
              path="/holiday"
              element={
                <ProtectedRoute>
                  <HolidayTracking />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster />
        </StaffProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;