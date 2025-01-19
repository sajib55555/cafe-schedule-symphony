import { supabase } from "@/integrations/supabase/client";

interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  position: string;
  department?: string;
  phone?: string;
}

export const handleSignUp = async (data: SignUpData) => {
  console.log("Handling signup with data:", { ...data, password: '[REDACTED]' });
  
  try {
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
      return { error: signUpError };
    }

    if (!authData.user) {
      console.error("No user data returned from signup");
      return { error: new Error("Failed to create account") };
    }

    // Update user profile with additional info
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: data.fullName,
        position: data.position,
        department: data.department || null,
        phone: data.phone || null,
        trial_start: new Date().toISOString(),
        trial_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days trial
        subscription_status: 'trial',
        role: 'staff',
        currency_symbol: '$'
      })
      .eq('id', authData.user.id);

    if (profileError) {
      console.error("Profile update error:", profileError);
      return { error: profileError };
    }

    console.log("Profile updated successfully");
    return { user: authData.user };
  } catch (error) {
    console.error("Error during sign up:", error);
    return { error };
  }
};