import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useNavigate } from "react-router-dom";
import { PersonalInfoFields } from "./signup/PersonalInfoFields";
import { FormData, formSchema } from "./signup/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AuthError } from "@supabase/supabase-js";

export const SignUpForm = ({ onModeChange }: { onModeChange: (mode: 'signup' | 'signin' | 'reset') => void }) => {
  const navigate = useNavigate();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      companyName: "",
      companyAddress: "",
      companyPhone: "",
      companyWebsite: "",
      companyDescription: "",
      position: "",
      department: "",
      phone: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      console.log("Starting signup process with data:", { ...data, password: '[REDACTED]' });
      
      // Step 1: Create the user account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
        },
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error("No user data returned after signup");

      console.log("User created successfully:", authData.user.id);

      // Step 2: Create the company
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .insert([
          {
            name: data.companyName,
            address: data.companyAddress,
            phone: data.companyPhone,
            website: data.companyWebsite,
            description: data.companyDescription,
            industry: 'Other',
            size: 'Small'
          }
        ])
        .select()
        .single();

      if (companyError) throw companyError;
      console.log("Company created successfully:", companyData.id);

      // Step 3: Update the user's profile with company information
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: data.fullName,
          company_id: companyData.id,
          position: data.position,
          department: data.department,
          phone: data.phone,
          trial_start: new Date().toISOString(),
          trial_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          subscription_status: 'trial'
        })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;
      
      console.log("Profile updated successfully");
      toast.success("Your account has been created with a 30-day trial period!");
      
      // Add a small delay to ensure the auth state is updated
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error: any) {
      console.error("Error during sign up:", error);
      
      if (error instanceof AuthError && error.message.includes("already registered")) {
        toast.error("An account with this email already exists. Please sign in instead.");
        setTimeout(() => onModeChange('signin'), 2000);
      } else {
        toast.error(error.message || "Failed to create account");
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <PersonalInfoFields form={form} />
        <div className="space-y-4">
          <Button type="submit" className="w-full">
            Create Account
          </Button>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => onModeChange('signin')}
                className="text-primary hover:underline"
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
};