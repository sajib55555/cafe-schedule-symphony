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
    const initializeAuth = async () => {
      try {
        await checkSession();
        await checkAccessStatus();
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      setSession(session);
      if (session) {
        await checkAccessStatus();
      } else {
        setHasAccess(false);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Current session:', session);
      setSession(session);
    } catch (error) {
      console.error('Error checking session:', error);
    }
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
          
          const hasActiveSubscription = profile.subscription_status === 'active';
          const hasActiveTrial = trialEnd ? now <= trialEnd : false;
          
          console.log('Access status check:', {
            trialEnd,
            now,
            hasActiveSubscription,
            hasActiveTrial
          });
          
          setHasAccess(hasActiveSubscription || hasActiveTrial);
          setTrialEnded(!hasActiveSubscription && trialEnd && now > trialEnd);
        }
      }
    } catch (error) {
      console.error('Error checking access status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF6E3] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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