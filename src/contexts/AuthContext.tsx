import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AuthError, Session, User } from "@supabase/supabase-js";

interface AuthContextType {
  loading: boolean;
  hasAccess: boolean;
  session: Session | null;
  trialEnded: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [trialEnded, setTrialEnded] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          throw sessionError;
        }

        setSession(initialSession);
        
        if (initialSession) {
          await checkAccessStatus();
        }

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          console.log('Auth state changed:', event);
          
          if (event === 'TOKEN_REFRESHED') {
            console.log('Token refreshed successfully');
          }

          if (event === 'SIGNED_OUT') {
            setSession(null);
            setHasAccess(false);
            setTrialEnded(false);
          }

          // Handle email confirmation
          if (event === 'USER_UPDATED' && newSession?.user?.email_confirmed_at) {
            console.log('Email confirmed successfully');
            toast.success('Email confirmed successfully! You can now sign in.');
            // Redirect to sign in page after confirmation
            window.location.href = '/auth';
          }

          if (newSession) {
            setSession(newSession);
            await checkAccessStatus();
          }
        });

        // Handle URL parameters for email confirmation and password reset
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const type = params.get('type');

        if (type === 'recovery' || type === 'signup' || type === 'email_confirmation') {
          console.log('Processing authentication callback:', type);
          try {
            if (accessToken && refreshToken) {
              const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
              });
              
              if (error) {
                console.error('Error setting session:', error);
                toast.error('Authentication failed. Please try again.');
              } else {
                if (type === 'email_confirmation') {
                  toast.success('Email confirmed successfully! You can now sign in.');
                  // Clear URL parameters and redirect to sign in
                  window.history.replaceState({}, document.title, '/auth');
                } else if (type === 'recovery') {
                  toast.success('You can now set a new password.');
                  // Handle password reset flow
                  const { error: updateError } = await supabase.auth.updateUser({
                    password: params.get('password') || ''
                  });

                  if (updateError) {
                    console.error('Error updating password:', updateError);
                    toast.error('Failed to update password. Please try again.');
                  } else {
                    toast.success('Password updated successfully! You can now sign in.');
                    window.location.href = '/auth';
                  }
                }
              }
            }
          } catch (error) {
            console.error('Error during authentication callback:', error);
            toast.error('Authentication failed. Please try again.');
          }
        }

        return () => {
          subscription.unsubscribe();
        };
      } catch (error: any) {
        console.error('Error in auth initialization:', error);
        
        // If there's a refresh token error, clear the session
        if (error.message?.includes('refresh_token_not_found')) {
          await supabase.auth.signOut();
          setSession(null);
          setHasAccess(false);
          toast.error("Your session has expired. Please sign in again.");
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const checkAccessStatus = async () => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (currentSession?.user) {
        console.log('Checking access status for user:', currentSession.user.email);
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('trial_start, trial_end, subscription_status')
          .eq('id', currentSession.user.id)
          .single();

        if (profile) {
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
      }
    } catch (error) {
      console.error('Error checking access status:', error);
      setHasAccess(false);
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