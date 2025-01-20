import { useState } from "react";
import { SignInForm } from "@/components/SignInForm";
import { SignUpForm } from "@/components/SignUpForm";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";
import { Card } from "@/components/ui/card";
import { Coffee } from "lucide-react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

type AuthMode = 'signin' | 'signup' | 'reset';

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const { session } = useAuth();
  const location = useLocation();

  // Redirect if user is already authenticated
  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-primary rounded-full p-3">
              <Coffee className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            {mode === 'signin' ? 'Welcome back' : 
             mode === 'signup' ? 'Get started today' : 
             'Reset your password'}
          </h1>
          <p className="text-muted-foreground">
            {mode === 'signin' ? 'Sign in to your account' : 
             mode === 'signup' ? 'Create your account' : 
             'Enter your email to reset your password'}
          </p>
        </div>

        <Card className="p-6 shadow-xl bg-white/80 backdrop-blur-sm border-0">
          {mode === 'signin' && <SignInForm onModeChange={setMode} />}
          {mode === 'signup' && <SignUpForm onModeChange={setMode} />}
          {mode === 'reset' && <ResetPasswordForm onModeChange={setMode} />}
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          By continuing, you agree to our{' '}
          <a href="#" className="font-medium text-primary hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="font-medium text-primary hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};

export default Auth;