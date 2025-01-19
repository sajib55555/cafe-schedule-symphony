import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function SessionManager() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          await supabase.auth.signOut();
          localStorage.clear();
          navigate("/auth");
          return;
        }
        
        if (!session?.user) {
          console.log('No session found, redirecting to auth');
          localStorage.clear();
          navigate("/auth");
          return;
        }

        // Then attempt to fetch the profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          if (profileError.message?.includes('JWT expired') || 
              profileError.message?.includes('Failed to fetch') ||
              profileError.message?.includes('session_not_found')) {
            console.log('Invalid session, clearing and redirecting');
            await supabase.auth.signOut();
            localStorage.clear();
            navigate("/auth");
            return;
          }
          toast.error('Error checking subscription status');
          return;
        }

        // If no profile exists, create one
        if (!profile) {
          console.log('No profile found, creating new profile');
          const { error: createError } = await supabase
            .from('profiles')
            .insert([{
              id: session.user.id,
              email: session.user.email,
              trial_start: new Date().toISOString(),
              trial_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
              subscription_status: 'trial',
              role: 'staff',
              currency_symbol: '$'
            }]);

          if (createError) {
            console.error('Error creating profile:', createError);
            toast.error('Error creating user profile');
            return;
          }
        }
      } catch (error: any) {
        console.error('Error in checkSession:', error);
        await supabase.auth.signOut();
        localStorage.clear();
        navigate("/auth");
      }
    };

    checkSession();
  }, [navigate]);

  return null;
}