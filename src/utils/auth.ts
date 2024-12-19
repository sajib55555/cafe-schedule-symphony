import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type SignUpData = {
  email: string;
  password: string;
  fullName: string;
  companyName: string;
  industry?: string;
  companySize?: string;
};

export const handleSignUp = async (values: SignUpData) => {
  try {
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
      if (authError.message === "User already registered") {
        toast({
          title: "Account Already Exists",
          description: "Please sign in instead or use a different email address.",
          variant: "destructive",
        });
        return null;
      }
      throw authError;
    }

    if (!authData.user) {
      throw new Error("No user data returned after signup");
    }

    // Create company after successful signup
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .insert([
        {
          name: values.companyName,
          industry: values.industry || null,
          size: values.companySize || null,
        }
      ])
      .select()
      .single();

    if (companyError) {
      console.error('Company creation error:', companyError);
      throw new Error("Failed to create company profile");
    }

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
      throw new Error("Failed to update profile with company information");
    }

    return authData.user;
  } catch (error: any) {
    console.error('Signup error:', error);
    throw error;
  }
};