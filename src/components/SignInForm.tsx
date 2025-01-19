import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SignInFields } from "./signin/SignInFields";
import { SignInFormData, signInFormSchema } from "./signin/types";

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
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      if (authData.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          throw profileError;
        }

        if (!profile) {
          console.log("Creating profile for user:", authData.user.id);
          const { error: createError } = await supabase
            .from('profiles')
            .insert([{
              id: authData.user.id,
              email: authData.user.email,
              trial_start: new Date().toISOString(),
              trial_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
              subscription_status: 'trial',
              role: 'staff',
              currency_symbol: '$'
            }]);

          if (createError) {
            console.error("Error creating profile:", createError);
            throw createError;
          }
        }

        toast.success("Successfully signed in!");
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast.error(error.message || "Failed to sign in");
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