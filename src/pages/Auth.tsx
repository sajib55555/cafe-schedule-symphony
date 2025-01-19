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
        
        // Try both hash and search parameters
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const urlParams = new URLSearchParams(window.location.search);
        
        // Check both locations for tokens
        const accessToken = hashParams.get('access_token') || urlParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || urlParams.get('refresh_token');
        const type = hashParams.get('type') || urlParams.get('type');

        console.log('Token check:', {
          accessToken: accessToken ? 'present' : 'missing',
          refreshToken: refreshToken ? 'present' : 'missing',
          type,
          hashParams: Object.fromEntries(hashParams),
          urlParams: Object.fromEntries(urlParams)
        });

        // Check if this is an email confirmation
        if (type === 'signup' && accessToken && refreshToken) {
          console.log('Processing email confirmation...');

          // Set the session with the tokens
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error('Session error:', sessionError);
            throw sessionError;
          }

          if (!sessionData.session) {
            console.error('No session established after confirmation');
            throw new Error('No session established after confirmation');
          }

          console.log('Session established successfully');

          // Get user details to confirm verification
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          
          if (userError) {
            console.error('User error:', userError);
            throw userError;
          }

          if (!user) {
            console.error('No user found after verification');
            throw new Error('No user found after verification');
          }

          console.log('User verified successfully:', user.email);

          // Email confirmed successfully
          toast.success("Email verified successfully! You can now sign in.");
          
          // Clear both hash and search parameters
          window.history.replaceState({}, document.title, '/auth');
          
          // Redirect to dashboard
          navigate('/dashboard', { replace: true });
        } else {
          console.log('Not a signup confirmation or missing tokens');
        }
      } catch (error: any) {
        console.error('Error during email confirmation:', error);
        toast.error("Failed to verify email. Please try again or contact support.");
        // Stay on auth page but clear URL parameters
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