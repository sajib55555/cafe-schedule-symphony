import { useState, useEffect } from "react";
import { SignInForm } from "@/components/SignInForm";
import { SignUpForm } from "@/components/SignUpForm";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type AuthMode = 'signin' | 'signup' | 'reset';

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const navigate = useNavigate();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        console.log('Starting email confirmation process...');
        console.log('Current URL:', window.location.href);
        
        // Only handle hash parameters
        const hash = window.location.hash;
        if (!hash) {
          console.log('No hash parameters found');
          return;
        }

        // Remove the # symbol and parse parameters
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const type = params.get('type');

        console.log('Token check:', {
          accessToken: accessToken ? 'present' : 'missing',
          refreshToken: refreshToken ? 'present' : 'missing',
          type
        });

        if (!accessToken || !refreshToken) {
          console.log('Missing required tokens');
          return;
        }

        console.log('Setting session with tokens...');
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }

        console.log('Session established:', sessionData);
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
          console.error('User error:', userError);
          throw userError;
        }

        if (!user) {
          console.error('No user found after verification');
          throw new Error('No user found after verification');
        }

        // Check if profile exists using maybeSingle() instead of single()
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Profile error:', profileError);
          throw profileError;
        }

        // If no profile exists, create one
        if (!profile) {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([
              {
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name,
                trial_start: new Date().toISOString(),
                trial_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                subscription_status: 'trial'
              }
            ]);

          if (insertError) {
            console.error('Error creating profile:', insertError);
            throw insertError;
          }
        }

        console.log('User verified successfully:', user.email);
        
        // Clean up URL
        window.history.replaceState({}, document.title, '/auth');
        
        // Show success message and redirect
        toast.success("Email verified successfully! Redirecting to dashboard...");
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1500);
      } catch (error: any) {
        console.error('Error during email confirmation:', error);
        toast.error("Failed to verify email. Please try again or contact support.");
        window.history.replaceState({}, document.title, '/auth');
      }
    };

    handleEmailConfirmation();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Welcome to Café Schedule Manager</h1>
          <p className="mt-2 text-muted-foreground">
            {mode === 'signin' ? 'Sign in to your account' : 
             mode === 'signup' ? 'Start your free 30-day trial' : 
             'Reset your password'}
          </p>
        </div>

        <div className="bg-card shadow-lg rounded-lg p-6">
          {mode === 'signin' && <SignInForm onModeChange={setMode} />}
          {mode === 'signup' && <SignUpForm onModeChange={setMode} />}
          {mode === 'reset' && <ResetPasswordForm onModeChange={setMode} />}
        </div>
      </div>
    </div>
  );
};

export default Auth;