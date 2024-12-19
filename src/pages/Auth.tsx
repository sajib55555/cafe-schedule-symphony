import { useState } from "react";
import { SignInForm } from "@/components/SignInForm";
import { SignUpForm } from "@/components/SignUpForm";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";

type AuthMode = 'signin' | 'signup' | 'reset';

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>('signin');

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