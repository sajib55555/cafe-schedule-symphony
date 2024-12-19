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

    // Set trial dates
    const trialStart = new Date();
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 30); // 30-day trial

    // Update profile with trial dates
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        trial_start: trialStart.toISOString(),
        trial_end: trialEnd.toISOString(),
      })
      .eq('id', authData.user.id);

    if (profileError) {
      console.error('Profile update error:', profileError);
      throw profileError;
    }

    console.log('User created successfully:', authData.user.id);
    return authData.user;
  } catch (error: any) {
    console.error('Signup error:', error);
    toast.error(error.message || "Failed to create account");
    throw error;
  }
};