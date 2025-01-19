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
        
        // Get hash parameters (remove the # symbol)
        const hash = window.location.hash.substring(1);
        console.log('Hash:', hash);
        
        // Parse the hash string manually
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const type = params.get('type');

        console.log('Parsed parameters:', {
          accessToken: accessToken ? 'present' : 'missing',
          refreshToken: refreshToken ? 'present' : 'missing',
          type,
          allParams: Object.fromEntries(params)
        });

        if (type === 'signup' && accessToken && refreshToken) {
          console.log('Valid signup confirmation detected');

          // Set the session
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error('Session error:', sessionError);
            throw sessionError;
          }

          console.log('Session established:', sessionData);

          // Get user details
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

          // Clear hash
          window.location.hash = '';

          // Show success message
          toast.success("Email verified successfully! Redirecting to dashboard...");

          // Redirect to dashboard
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 1500);
        } else {
          console.log('Not a signup confirmation or missing tokens');
        }
      } catch (error: any) {
        console.error('Error during email confirmation:', error);
        toast.error("Failed to verify email. Please try again or contact support.");
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