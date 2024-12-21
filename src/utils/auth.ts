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

    // First check if user exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', values.email)
      .maybeSingle();

    if (existingUser) {
      toast.error("An account with this email already exists. Please sign in instead.");
      return null;
    }

    // Create the user account
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

    // Wait for a short time to ensure the user is created and session is established
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create a new company for the user using the established session
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .insert([
        { 
          name: `${values.fullName}'s Company`,
          industry: 'Other',
          size: 'Small'
        }
      ])
      .select()
      .single();

    if (companyError) {
      console.error('Company creation error:', companyError);
      throw companyError;
    }

    // Set trial dates
    const trialStart = new Date();
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 2); // 2 days trial period

    // Update profile with trial dates and company_id
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        trial_start: trialStart.toISOString(),
        trial_end: trialEnd.toISOString(),
        company_id: companyData.id,
        full_name: values.fullName
      })
      .eq('id', authData.user.id);

    if (profileError) {
      console.error('Profile update error:', profileError);
      throw profileError;
    }

    console.log('User and company created successfully:', authData.user.id);
    return authData.user;
  } catch (error: any) {
    console.error('Signup error:', error);
    if (error.message.includes("already registered")) {
      toast.error("An account with this email already exists. Please sign in instead.");
    } else {
      toast.error(error.message || "Failed to create account");
    }
    throw error;
  }
};