import { Navigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProtectedRouteProps {
  session: any;
  hasAccess: boolean;
  trialEnded: boolean;
  children: React.ReactNode;
}

export const ProtectedRoute = ({
  session,
  hasAccess,
  trialEnded,
  children,
}: ProtectedRouteProps) => {
  useEffect(() => {
    const verifyProfile = async () => {
      if (session?.user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (error) {
          console.error('Error verifying profile:', error);
          toast.error('Error verifying user profile');
          return;
        }

        if (!profile) {
          console.log('Creating profile for user:', session.user.id);
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
            }])
            .select()
            .maybeSingle();

          if (createError) {
            console.error('Error creating profile:', createError);
            toast.error('Error creating user profile');
          }
        }
      }
    };

    verifyProfile();
  }, [session]);

  if (!session) {
    return <Navigate to="/" replace />;
  }

  if (trialEnded && !hasAccess) {
    return <Navigate to="/upgrade" replace />;
  }

  return children;
};