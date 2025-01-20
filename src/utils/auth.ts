import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type SignUpData = {
  email: string;
  password: string;
  fullName: string;
  companyName: string;
  companyAddress?: string;
  companyPhone?: string;
  companyWebsite?: string;
  companyDescription?: string;
  position: string;
  department?: string;
  phone?: string;
};

export const handleSignUp = async (values: SignUpData) => {
  try {
    console.log('Starting signup process with values:', values);

    // First, create the auth user
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

    // Wait for session to be established
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get fresh session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.error('Session error:', sessionError);
      throw sessionError || new Error('No session available');
    }

    // Create the company with the authenticated session
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .insert([
        {
          name: values.companyName,
          address: values.companyAddress,
          phone: values.companyPhone,
          website: values.companyWebsite,
          description: values.companyDescription,
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
        full_name: values.fullName,
        position: values.position,
        department: values.department,
        phone: values.phone,
        email: values.email
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