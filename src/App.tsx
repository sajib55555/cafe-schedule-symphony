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
import UpgradePage from "./pages/UpgradePage";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

const App = () => {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    checkSession();
    checkAccessStatus();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        checkAccessStatus();
      } else {
        setHasAccess(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
  };

  const checkAccessStatus = async () => {
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
          
          // Grant access if user has an active subscription or is within trial period
          setHasAccess(
            profile.subscription_status === 'active' || 
            (trialEnd && trialEnd > now)
          );
        }
      }
    } catch (error) {
      console.error('Error checking access status:', error);
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
                  session ? (
                    hasAccess ? (
                      <Layout>
                        <Index />
                      </Layout>
                    ) : (
                      <Navigate to="/upgrade" replace />
                    )
                  ) : (
                    <Navigate to="/auth" replace />
                  )
                }
              />
              <Route 
                path="/auth" 
                element={
                  session ? (
                    <Navigate to="/" replace />
                  ) : (
                    <Auth />
                  )
                } 
              />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="/upgrade" element={<UpgradePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </StaffProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;