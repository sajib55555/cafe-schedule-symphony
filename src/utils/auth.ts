import { supabase } from "@/integrations/supabase/client";

interface SignUpData {
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
}

export const handleSignUp = async (data: SignUpData) => {
  console.log("Handling signup with data:", { ...data, password: '[REDACTED]' });
  
  // First create the user account
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
    throw signUpError;
  }

  if (!authData.user) {
    console.error("No user data returned from signup");
    throw new Error("Failed to create account");
  }

  try {
    console.log("Auth signup successful, creating company...");
    
    // Create company record with explicit columns
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: data.companyName,
        address: data.companyAddress || null,
        phone: data.companyPhone || null,
        website: data.companyWebsite || null,
        description: data.companyDescription || null,
      })
      .select()
      .single();

    if (companyError) {
      console.error("Company creation error:", companyError);
      throw companyError;
    }

    console.log("Company created successfully:", company);

    // Update user profile with company ID and additional info
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        company_id: company.id,
        position: data.position,
        department: data.department || null,
        phone: data.phone || null,
        trial_start: new Date().toISOString(),
        trial_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days trial
        subscription_status: 'trial',
      })
      .eq('id', authData.user.id);

    if (profileError) {
      console.error("Profile update error:", profileError);
      // If profile update fails, attempt to delete the company
      const { error: deleteCompanyError } = await supabase
        .from('companies')
        .delete()
        .eq('id', company.id);
      
      if (deleteCompanyError) {
        console.error("Failed to clean up company after profile error:", deleteCompanyError);
      }
      throw profileError;
    }

    console.log("Profile updated successfully");
    return authData.user;
  } catch (error) {
    // Instead of trying to delete the user (which requires admin rights),
    // we'll let the cleanup happen naturally when the email isn't confirmed
    console.error("Error during sign up:", error);
    throw error;
  }
};