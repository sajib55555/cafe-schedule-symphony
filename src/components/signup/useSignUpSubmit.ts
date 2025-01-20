import { FormData } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AuthError } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

export const useSignUpSubmit = (onModeChange: (mode: 'signup' | 'signin' | 'reset') => void) => {
  const navigate = useNavigate();

  const handleSignUp = async (data: FormData) => {
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

      if (signUpError) {
        console.error("Signup error:", signUpError);
        if (signUpError.message.includes("already registered")) {
          toast.error("An account with this email already exists. Please sign in instead.");
          setTimeout(() => onModeChange('signin'), 2000);
        } else {
          toast.error(signUpError.message);
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
      toast.success("Account created successfully! Please check your email to verify your account.");
      
      // Add a small delay before redirecting
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
      
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

  return { handleSignUp };
};