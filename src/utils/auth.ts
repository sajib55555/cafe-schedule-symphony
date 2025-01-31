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

    // Wait for session to be established
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get fresh session and ensure we're authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      throw sessionError;
    }

    if (!session) {
      console.error('No session available after signup');
      throw new Error("No session available after signup");
    }

    // Set the session in the Supabase client
    await supabase.auth.setSession(session);

    // Create a new company with the authenticated client
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

    // Update profile with trial dates, company_id, and additional info
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        trial_start: trialStart.toISOString(),
        trial_end: trialEnd.toISOString(),
        company_id: companyData.id,
        full_name: values.fullName,
        position: values.position,
        department: values.department,
        phone: values.phone
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