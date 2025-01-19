import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setSession(session);
      
      if (session) {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Wait for auth.users record to be fully created
          await new Promise(resolve => setTimeout(resolve, 1000));
          await checkAccessStatus();
        }
      } else {
        setHasAccess(false);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        toast.error('Error checking session status');
        setLoading(false);
        return;
      }

      setSession(session);
      
      if (session) {
        // Wait for auth.users record to be fully created
        await new Promise(resolve => setTimeout(resolve, 1000));
        await checkAccessStatus();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking session:', error);
      toast.error('Error checking session status');
      setLoading(false);
    }
  };

  const checkAccessStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        console.log('No active session found');
        setHasAccess(false);
        setLoading(false);
        return;
      }

      console.log('Checking access status for user:', session.user.email);
      
      // First verify the auth user exists and is valid
      const { data: authUser, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth user error:', authError);
        if (authError.message.includes('JWT')) {
          await supabase.auth.signOut();
          toast.error('Your session has expired. Please sign in again.');
        } else {
          toast.error('Error verifying user authentication');
        }
        setLoading(false);
        return;
      }

      if (!authUser.user) {
        console.error('No auth user found');
        setLoading(false);
        return;
      }

      // Now check for profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('trial_start, trial_end, subscription_status, company_id')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Profile error:', profileError);
        toast.error('Error checking access status');
        setLoading(false);
        return;
      }

      if (!profile) {
        console.log('No profile found, creating one...');
        try {
          const { error: createError } = await supabase
            .from('profiles')
            .insert([{
              id: session.user.id,
              email: session.user.email,
              full_name: session.user.user_metadata?.full_name,
              trial_start: new Date().toISOString(),
              trial_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              subscription_status: 'trial'
            }])
            .select()
            .maybeSingle();

          if (createError) {
            console.error('Error creating profile:', createError);
            toast.error('Error creating user profile');
            setLoading(false);
            return;
          }

          setHasAccess(true);
          setTrialEnded(false);
        } catch (error) {
          console.error('Error in profile creation:', error);
          toast.error('Failed to create user profile');
          setLoading(false);
          return;
        }
      } else {
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
      toast.error('Error checking access status');
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