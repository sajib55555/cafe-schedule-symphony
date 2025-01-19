import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type SignUpData = {
  email: string;
  password: string;
  fullName: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyWebsite: string;
  companyDescription: string;
  position: string;
  department: string;
  phone: string;
};

export const handleSignUp = async (values: SignUpData) => {
  try {
    console.log('Starting signup process with values:', { ...values, password: '[REDACTED]' });

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

    // Create a new company
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
    trialEnd.setDate(trialEnd.getDate() + 30); // 30 days trial period

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
      .eq('id', session.user.id);

    if (profileError) {
      console.error('Profile update error:', profileError);
      throw profileError;
    }

    console.log('User and company created successfully:', session.user.id);
    return session.user;
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