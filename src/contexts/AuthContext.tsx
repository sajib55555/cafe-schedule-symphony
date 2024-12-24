import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getSessionStatus, checkTrialStatus } from "@/utils/auth/sessionUtils";
import { useProfile } from "@/hooks/useProfile";

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
  const { fetchProfile } = useProfile();

  const checkAccessStatus = async (currentSession: any) => {
    if (!currentSession?.user) return;
    
    try {
      const profile = await fetchProfile(currentSession.user.id);
      console.log('Profile fetched:', profile);
      
      if (profile) {
        const { hasAccess: newHasAccess, trialEnded: newTrialEnded } = checkTrialStatus(profile);
        setHasAccess(newHasAccess);
        setTrialEnded(newTrialEnded);
        console.log('Access status updated:', { newHasAccess, newTrialEnded });
      }
    } catch (error) {
      console.error('Error checking access status:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const currentSession = await getSessionStatus();
        console.log('Current session:', currentSession);
        
        if (!mounted) return;
        
        if (currentSession) {
          setSession(currentSession);
          await checkAccessStatus(currentSession);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth state changed:', event, newSession);
      
      if (!mounted) return;
      
      if (newSession) {
        setSession(newSession);
        await checkAccessStatus(newSession);
      } else {
        setSession(null);
        setHasAccess(false);
        setTrialEnded(false);
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

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