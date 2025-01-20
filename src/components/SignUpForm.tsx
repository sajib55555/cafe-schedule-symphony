import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useNavigate } from "react-router-dom";
import { PersonalInfoFields } from "./signup/PersonalInfoFields";
import { FormData, formSchema } from "./signup/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AuthError, AuthApiError } from "@supabase/supabase-js";

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
      
      // First check if user exists by attempting to sign in with a random password
      const { error: checkError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: 'checkuserexistence',
      });

      // If the error message indicates invalid credentials, the user exists
      if (checkError && !checkError.message.includes("Invalid login credentials")) {
        console.error("Error checking existing user:", checkError);
        toast.error("An error occurred. Please try again.");
        return;
      }

      if (!checkError) {
        console.log("User already exists:", data.email);
        toast.error("An account with this email already exists. Please sign in instead.");
        setTimeout(() => onModeChange('signin'), 2000);
        return;
      }

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

      if (signUpError) {
        console.error("Signup error:", signUpError);
        if (signUpError instanceof AuthApiError && signUpError.message.includes("already registered")) {
          toast.error("An account with this email already exists. Please sign in instead.");
          setTimeout(() => onModeChange('signin'), 2000);
        } else {
          toast.error(signUpError.message || "Failed to create account");
        }
        return;
      }

      if (!authData.user) {
        console.error("No user data returned after signup");
        toast.error("Failed to create account");
        return;
      }

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

      if (companyError) {
        console.error('Company creation error:', companyError);
        toast.error("Failed to create company profile");
        return;
      }

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

      if (profileError) {
        console.error('Profile update error:', profileError);
        toast.error("Failed to create user profile");
        return;
      }
      
      console.log("Profile updated successfully");
      toast.success("Your account has been created successfully!");
      
      // Add a small delay to ensure the auth state is updated
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error: any) {
      console.error("Error during sign up:", error);
      
      if (error instanceof AuthApiError && error.message.includes("already registered")) {
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