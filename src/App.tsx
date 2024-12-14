import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { StaffProvider } from "./contexts/StaffContext";
import { Layout } from "./components/Layout";
import Index from "./pages/Index";
import AuthPage from "./pages/Auth";
import SubscriptionPage from "./pages/Subscription";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <StaffProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/"
              element={
                <Navigate to="/subscription" replace />
              }
            />
            <Route path="/subscription" element={
              <Layout>
                <SubscriptionPage />
              </Layout>
            } />
            <Route path="*" element={<Navigate to="/subscription" replace />} />
          </Routes>
        </BrowserRouter>
      </StaffProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;