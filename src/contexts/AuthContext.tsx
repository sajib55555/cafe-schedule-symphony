import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  loading: boolean;
  hasAccess: boolean;
  session: any;
  trialEnded: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [trialEnded, setTrialEnded] = useState(false);

  useEffect(() => {
    checkSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth state changed:", _event, session?.user?.id);
      setSession(session);
      if (session) {
        await checkAccessStatus(session);
      } else {
        setHasAccess(false);
        setTrialEnded(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Initial session check:", session?.user?.id);
      setSession(session);
      if (session) {
        await checkAccessStatus(session);
      }
    } catch (error) {
      console.error("Error checking session:", error);
    }
  };

  const checkAccessStatus = async (session: any) => {
    try {
      console.log("Checking access status for user:", session.user.id);
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('trial_start, trial_end, subscription_status, company_id')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        setHasAccess(false);
        setLoading(false);
        return;
      }

      // If no profile exists, create one with default trial period
      if (!profile) {
        console.log("Creating new profile for user:", session.user.id);
        const now = new Date();
        const trialEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        const { error: createError } = await supabase
          .from('profiles')
          .insert([{
            id: session.user.id,
            email: session.user.email,
            trial_start: now.toISOString(),
            trial_end: trialEnd.toISOString(),
            subscription_status: 'trial'
          }]);

        if (createError) {
          console.error("Error creating profile:", createError);
          setHasAccess(false);
        } else {
          setHasAccess(true);
          setTrialEnded(false);
        }
        setLoading(false);
        return;
      }

      const now = new Date();
      const trialEnd = profile.trial_end ? new Date(profile.trial_end) : null;
      
      // Check if user has an active subscription
      const hasActiveSubscription = profile.subscription_status === 'active';
      console.log("Subscription status:", profile.subscription_status);
      
      // Check if trial is still active
      const hasActiveTrial = trialEnd ? now <= trialEnd : false;
      console.log("Trial status - End:", trialEnd, "Current:", now, "Active:", hasActiveTrial);
      
      // Grant access if either subscription is active OR trial is active
      const userHasAccess = hasActiveSubscription || hasActiveTrial;
      console.log("Access granted:", userHasAccess);
      
      setHasAccess(userHasAccess);
      setTrialEnded(!hasActiveSubscription && trialEnd && now > trialEnd);
    } catch (error) {
      console.error("Error checking access status:", error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ loading, hasAccess, session, trialEnded }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};