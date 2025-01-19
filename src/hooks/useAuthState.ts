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

        setSession(initialSession);
        onSessionChange(initialSession);

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

          if (newSession) {
            setSession(newSession);
            onSessionChange(newSession);
          }
        });

        // Handle URL parameters for password reset and email confirmation
        const params = new URLSearchParams(window.location.search);
        const type = params.get('type');
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if ((type === 'recovery' || type === 'signup' || type === 'email_confirmation') && accessToken && refreshToken) {
          console.log('Processing authentication callback:', type);
          await handleAuthCallback(accessToken, refreshToken, type);
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
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [onSessionChange]);

  return { loading, session };
};