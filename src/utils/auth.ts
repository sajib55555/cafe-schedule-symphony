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

  console.log("Auth signup successful, creating company...");
  
  // Create company record
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .insert([
      {
        name: data.companyName,
        address: data.companyAddress,
        phone: data.companyPhone,
        website: data.companyWebsite,
        description: data.companyDescription,
      },
    ])
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
      department: data.department,
      phone: data.phone,
    })
    .eq('id', authData.user.id);

  if (profileError) {
    console.error("Profile update error:", profileError);
    throw profileError;
  }

  console.log("Profile updated successfully");
  return authData.user;
};