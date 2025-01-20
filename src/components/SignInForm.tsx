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

  const onSubmit = async (data: SignInFormData) => {
    try {
      console.log("Attempting sign in for email:", data.email);
      
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) {
        console.error("Sign in error:", signInError);
        if (signInError.message.includes("Email not confirmed")) {
          toast.error("Please verify your email address before signing in. Check your inbox for the verification link.", {
            duration: 5000
          });
        } else if (signInError.message.includes("Invalid login credentials")) {
          toast.error("Invalid email or password. Please check your credentials.");
        } else {
          toast.error(signInError.message);
        }
        return;
      }

      if (!authData.user) {
        toast.error("No user data returned after signin");
        return;
      }

      console.log("Sign in successful for user:", authData.user.id);
      toast.success("Successfully signed in!");
      
      // Add a longer delay before navigation to ensure the toast is visible
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
      
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast.error("Failed to sign in. Please try again.");
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