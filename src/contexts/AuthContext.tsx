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
        console.log('Checking access status for user:', session.user.email);
        
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('trial_start, trial_end, subscription_status')
          .eq('id', session.user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching profile:', error);
          setHasAccess(false);
          setLoading(false);
          return;
        }

        // If no profile exists, create one with default trial period
        if (!profile) {
          const now = new Date();
          const trialEnd = new Date();
          trialEnd.setDate(trialEnd.getDate() + 30); // 30 days trial

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
            console.error('Error creating profile:', createError);
            setHasAccess(false);
            setLoading(false);
            return;
          }

          setHasAccess(true);
          setTrialEnded(false);
          setLoading(false);
          return;
        }

        const now = new Date();
        const trialEnd = profile.trial_end ? new Date(profile.trial_end) : null;
        
        // Check if user has an active subscription
        const hasActiveSubscription = profile.subscription_status === 'active';
        console.log('Subscription status:', profile.subscription_status);
        console.log('Has active subscription:', hasActiveSubscription);
        
        // Check if trial is still active
        const hasActiveTrial = trialEnd ? now <= trialEnd : false;
        console.log('Trial end:', trialEnd);
        console.log('Current time:', now);
        console.log('Has active trial:', hasActiveTrial);
        
        // Grant access if either subscription is active OR trial is active
        const userHasAccess = hasActiveSubscription || hasActiveTrial;
        console.log('User has access:', userHasAccess);
        
        setHasAccess(userHasAccess);
        // Set trial ended only if there's no active subscription AND trial has ended
        setTrialEnded(!hasActiveSubscription && trialEnd && now > trialEnd);
      }
    } catch (error) {
      console.error('Error checking access status:', error);
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