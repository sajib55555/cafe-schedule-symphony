import { useEffect, useState } from "react";
import { SignInForm } from "@/components/SignInForm";
import { SignUpForm } from "@/components/SignUpForm";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

type AuthMode = 'signin' | 'signup' | 'reset';

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        console.log('Starting email confirmation process...');
        console.log('Current URL:', window.location.href);
        
        const hash = window.location.hash;
        if (!hash) {
          console.log('No hash parameters found');
          return;
        }

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

        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) throw sessionError;

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error('No user found after verification');

        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        // Create profile if it doesn't exist
        if (!profile) {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([{
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name,
              trial_start: new Date().toISOString(),
              trial_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              subscription_status: 'trial'
            }]);

          if (insertError) throw insertError;
        }

        window.history.replaceState({}, document.title, '/auth');
        navigate('/dashboard');
      } catch (error: any) {
        console.error('Error during email confirmation:', error);
        setError(error.message);
      }
    };

    handleEmailConfirmation();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/dashboard');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
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

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

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