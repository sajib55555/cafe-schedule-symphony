import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { StaffProvider } from "./contexts/StaffContext";
import { Layout } from "./components/Layout";
import Index from "./pages/Index";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";
import Subscription from "./pages/Subscription";

const queryClient = new QueryClient();

const App = () => {
  const [loading, setLoading] = useState(true);
  const [hasActiveTrial, setHasActiveTrial] = useState(false);

  useEffect(() => {
    checkTrialStatus();
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        checkTrialStatus();
      } else {
        setHasActiveTrial(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkTrialStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('trial_start, trial_end, subscription_status')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          const now = new Date();
          const trialEnd = profile.trial_end ? new Date(profile.trial_end) : null;
          setHasActiveTrial(
            profile.subscription_status === 'active' || 
            (trialEnd ? trialEnd > now : false)
          );
        }
      }
    } catch (error) {
      console.error('Error checking trial status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
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
                path="/"
                element={
                  hasActiveTrial ? (
                    <Layout>
                      <Index />
                    </Layout>
                  ) : (
                    <Navigate to="/subscription" replace />
                  )
                }
              />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </StaffProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;