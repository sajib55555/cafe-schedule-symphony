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
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";

const queryClient = new QueryClient();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [hasActiveTrial, setHasActiveTrial] = useState(false);

  useEffect(() => {
    // Check current session and trial status
    const checkSessionAndTrial = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        // Check trial status
        const { data: profile } = await supabase
          .from('profiles')
          .select('trial_start, trial_end')
          .eq('id', session.user.id)
          .single();

        setHasActiveTrial(profile?.trial_end && new Date(profile.trial_end) > new Date());
      }
      
      setIsLoading(false);
    };

    checkSessionAndTrial();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        // Check trial status when auth state changes
        const { data: profile } = await supabase
          .from('profiles')
          .select('trial_start, trial_end')
          .eq('id', session.user.id)
          .single();

        setHasActiveTrial(profile?.trial_end && new Date(profile.trial_end) > new Date());
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDF6E3] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <StaffProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route 
                path="/auth" 
                element={session ? <Navigate to={hasActiveTrial ? "/" : "/subscription"} replace /> : <AuthPage />} 
              />
              <Route
                path="/"
                element={
                  session ? (
                    hasActiveTrial ? (
                      <Layout>
                        <Index />
                      </Layout>
                    ) : (
                      <Navigate to="/subscription" replace />
                    )
                  ) : (
                    <Navigate to="/auth" replace />
                  )
                }
              />
              <Route 
                path="/subscription" 
                element={
                  session ? (
                    hasActiveTrial ? (
                      <Navigate to="/" replace />
                    ) : (
                      <Layout>
                        <SubscriptionPage />
                      </Layout>
                    )
                  ) : (
                    <Navigate to="/auth" replace />
                  )
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </StaffProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;