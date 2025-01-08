import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AuthError } from "@supabase/supabase-js";

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
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        
        if (initialSession) {
          await checkAccessStatus();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        handleAuthError(error as AuthError);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      setSession(session);
      
      if (session) {
        try {
          await checkAccessStatus();
        } catch (error) {
          console.error('Error checking access status:', error);
          handleAuthError(error as AuthError);
        }
      } else {
        setHasAccess(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleAuthError = (error: AuthError) => {
    if (error.message.includes('refresh_token_not_found')) {
      toast.error('Your session has expired. Please sign in again.');
      supabase.auth.signOut();
    } else {
      toast.error(error.message || 'An authentication error occurred');
    }
  };

  const checkAccessStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        console.log('Checking access status for user:', session.user.email);
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('trial_start, trial_end, subscription_status')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          const now = new Date();
          const trialEnd = profile.trial_end ? new Date(profile.trial_end) : null;
          
          const hasActiveSubscription = profile.subscription_status === 'active';
          console.log('Subscription status:', profile.subscription_status);
          console.log('Has active subscription:', hasActiveSubscription);
          
          const hasActiveTrial = trialEnd ? now <= trialEnd : false;
          console.log('Trial end:', trialEnd);
          console.log('Current time:', now);
          console.log('Has active trial:', hasActiveTrial);
          
          const userHasAccess = hasActiveSubscription || hasActiveTrial;
          console.log('User has access:', userHasAccess);
          
          setHasAccess(userHasAccess);
          setTrialEnded(!hasActiveSubscription && trialEnd && now > trialEnd);
        }
      }
    } catch (error) {
      console.error('Error checking access status:', error);
      throw error;
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