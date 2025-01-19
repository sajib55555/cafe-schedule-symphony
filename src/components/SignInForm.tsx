import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SignInFields } from "./signin/SignInFields";
import { SignInFormData, signInFormSchema } from "./signin/types";
import { AuthError } from "@supabase/supabase-js";

export const SignInForm = ({ onModeChange }: { onModeChange: (mode: 'signup' | 'signin' | 'reset') => void }) => {
  const navigate = useNavigate();

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleAuthError = (error: AuthError) => {
    console.error('Auth error:', error);
    switch (error.message) {
      case 'Invalid login credentials':
        return 'Invalid email or password';
      case 'Email not confirmed':
        return 'Please verify your email before signing in';
      default:
        return error.message;
    }
  };

  const onSubmit = async (data: SignInFormData) => {
    try {
      console.log('Attempting to sign in with:', data.email);
      
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        console.error('Sign in error:', error);
        toast.error(handleAuthError(error));
        return;
      }

      if (!authData.session) {
        console.error('No session after sign in');
        toast.error('Failed to establish session');
        return;
      }

      // Get user's profile to ensure it exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.session.user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        toast.error('Error fetching user profile');
        return;
      }

      if (!profile) {
        console.error('No profile found for user');
        toast.error('User profile not found');
        return;
      }

      console.log('Successfully signed in and verified profile');
      toast.success("Successfully signed in!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Unexpected sign in error:", error);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SignInFields form={form} />
        <div className="space-y-4">
          <Button type="submit" className="w-full">
            Sign In
          </Button>
          <div className="text-center space-y-2">
            <button
              type="button"
              onClick={() => onModeChange('reset')}
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </button>
            <div className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => onModeChange('signup')}
                className="text-primary hover:underline"
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
};