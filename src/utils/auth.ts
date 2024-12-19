import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type SignUpData = {
  email: string;
  password: string;
  fullName: string;
  companyName: string;
  industry: string | null;
  companySize: string | null;
};

export const handleSignUp = async (values: SignUpData) => {
  try {
    console.log('Starting signup process with values:', values);

    // Check if user exists first
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', values.email)
      .single();

    if (existingUser) {
      toast.error("An account with this email already exists. Please sign in instead.");
      return null;
    }

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
      throw authError;
    }

    if (!authData.user) {
      console.error('No user data returned after signup');
      throw new Error("No user data returned after signup");
    }

    console.log('User created successfully:', authData.user.id);

    // Create company
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .insert([
        {
          name: values.companyName,
          industry: values.industry,
          size: values.companySize,
        }
      ])
      .select()
      .single();

    if (companyError) {
      console.error('Company creation error:', companyError);
      throw companyError;
    }

    console.log('Company created successfully:', companyData.id);

    // Set trial dates
    const trialStart = new Date();
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 30);

    // Update profile with company_id and trial dates
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        company_id: companyData.id,
        trial_start: trialStart.toISOString(),
        trial_end: trialEnd.toISOString(),
      })
      .eq('id', authData.user.id);

    if (profileError) {
      console.error('Profile update error:', profileError);
      throw profileError;
    }

    console.log('Profile updated successfully with company and trial info');
    return authData.user;
  } catch (error: any) {
    console.error('Signup error:', error);
    if (error.message === "User already registered") {
      toast.error("Account already exists. Please sign in instead.");
      return null;
    }
    toast.error(error.message || "Failed to create account");
    throw error;
  }
};