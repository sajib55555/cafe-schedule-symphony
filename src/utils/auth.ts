import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type SignUpData = {
  email: string;
  password: string;
  fullName: string;
};

export const handleSignUp = async (values: SignUpData) => {
  try {
    console.log('Starting signup process with values:', values);

    // First create the user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.fullName,
        },
      },
    });

    if (authError) {
      console.error('Auth error:', authError);
      if (authError.message === "User already registered") {
        toast.error("An account with this email already exists. Please sign in instead.");
        return null;
      }
      throw authError;
    }

    if (!authData.user) {
      console.error('No user data returned after signup');
      throw new Error("No user data returned after signup");
    }

    console.log('User created successfully:', authData.user.id);
    return authData.user;
  } catch (error: any) {
    console.error('Signup error:', error);
    toast.error(error.message || "Failed to create account");
    throw error;
  }
};