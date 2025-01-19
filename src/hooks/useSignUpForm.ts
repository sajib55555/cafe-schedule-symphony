import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormData, formSchema } from "@/components/signup/types";
import { supabase } from "@/integrations/supabase/client";
import { handleSignUp } from "@/utils/auth";
import { toast } from "sonner";
import { AuthError } from "@supabase/supabase-js";

export const useSignUpForm = (onModeChange: (mode: 'signup' | 'signin' | 'reset') => void) => {
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
      
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', data.email)
        .maybeSingle();

      if (existingUser) {
        console.log('User already exists:', data.email);
        toast.error("An account with this email already exists. Please sign in instead.");
        setTimeout(() => onModeChange('signin'), 2000);
        return;
      }

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });

      if (signUpError) {
        console.error('Signup error:', signUpError);
        throw signUpError;
      }

      if (!authData.user) {
        console.error('No user data returned after signup');
        throw new Error("No user data returned after signup");
      }

      console.log('User created successfully:', authData.user.id);

      const user = await handleSignUp(data);
      
      if (user) {
        console.log("Signup successful, user:", user);
        return {
          success: true,
          email: data.email,
          trialEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        };
      }
    } catch (error: any) {
      console.error("Error during sign up:", error);
      
      if (error instanceof AuthError) {
        if (error.message.includes("already registered")) {
          toast.error("An account with this email already exists. Please sign in instead.");
          setTimeout(() => onModeChange('signin'), 2000);
        } else if (error.message.includes("password")) {
          toast.error("Password must be at least 6 characters long");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error("Failed to create account. Please try again.");
      }
      return { success: false };
    }
    return { success: false };
  };

  return { form, onSubmit };
};