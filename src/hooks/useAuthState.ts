import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { handleAuthCallback } from "@/utils/authCallbacks";
import { toast } from "sonner";

export const useAuthState = (onSessionChange: (session: Session | null) => void) => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          throw sessionError;
        }

        if (initialSession?.user) {
          console.log('Checking profile for user:', initialSession.user.email);
          
          // Verify profile exists
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', initialSession.user.id)
            .maybeSingle();

          if (profileError) {
            console.error('Error fetching profile:', profileError);
            await supabase.auth.signOut();
            toast.error("Error verifying user profile. Please try signing in again.");
            setSession(null);
            onSessionChange(null);
            return;
          }

          if (!profile) {
            console.log('Creating profile for new user:', initialSession.user.email);
            // Try to create profile if it doesn't exist
            const { error: insertError } = await supabase
              .from('profiles')
              .insert([{ 
                id: initialSession.user.id,
                email: initialSession.user.email,
                trial_start: new Date().toISOString(),
                trial_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days trial
                subscription_status: 'trial'
              }]);

            if (insertError) {
              console.error('Error creating profile:', insertError);
              await supabase.auth.signOut();
              toast.error("Error creating user profile. Please contact support.");
              setSession(null);
              onSessionChange(null);
              return;
            }
          }

          setSession(initialSession);
          onSessionChange(initialSession);
        }

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          console.log('Auth state changed:', event);
          
          if (event === 'TOKEN_REFRESHED') {
            console.log('Token refreshed successfully');
          }

          if (event === 'SIGNED_OUT') {
            setSession(null);
            onSessionChange(null);
          }

          if (newSession?.user) {
            console.log('Verifying profile on auth state change for:', newSession.user.email);
            
            // Verify profile exists on auth state change
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', newSession.user.id)
              .maybeSingle();

            if (profileError) {
              console.error('Error fetching profile:', profileError);
              await supabase.auth.signOut();
              toast.error("Error verifying user profile. Please try signing in again.");
              setSession(null);
              onSessionChange(null);
              return;
            }

            if (!profile) {
              console.log('Creating profile for user on auth state change:', newSession.user.email);
              // Try to create profile if it doesn't exist
              const { error: insertError } = await supabase
                .from('profiles')
                .insert([{ 
                  id: newSession.user.id,
                  email: newSession.user.email,
                  trial_start: new Date().toISOString(),
                  trial_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days trial
                  subscription_status: 'trial'
                }]);

              if (insertError) {
                console.error('Error creating profile:', insertError);
                await supabase.auth.signOut();
                toast.error("Error creating user profile. Please contact support.");
                setSession(null);
                onSessionChange(null);
                return;
              }
            }

            setSession(newSession);
            onSessionChange(newSession);
          }
        });

        // Handle URL parameters for password reset and email confirmation
        const params = new URLSearchParams(window.location.search);
        const type = params.get('type');
        const accessToken = params.get('access_token');

        if ((type === 'recovery' || type === 'signup' || type === 'email_confirmation') && accessToken) {
          console.log('Processing authentication callback:', type);
          await handleAuthCallback(accessToken, type);
        }

        return () => {
          subscription.unsubscribe();
        };
      } catch (error: any) {
        console.error('Error in auth initialization:', error);
        
        if (error.message?.includes('refresh_token_not_found')) {
          await supabase.auth.signOut();
          setSession(null);
          onSessionChange(null);
          toast.error("Your session has expired. Please sign in again.");
        } else {
          toast.error("Authentication error. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [onSessionChange]);

  return { loading, session };
};