import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const handleEmailConfirmation = async () => {
  toast.success('Email confirmed successfully! You can now sign in.');
  // Clear URL parameters and redirect to sign in
  window.history.replaceState({}, document.title, '/auth');
};

export const handlePasswordReset = async (password: string | null) => {
  toast.success('You can now set a new password.');
  
  const { error: updateError } = await supabase.auth.updateUser({
    password: password || ''
  });

  if (updateError) {
    console.error('Error updating password:', updateError);
    toast.error('Failed to update password. Please try again.');
    return false;
  }

  toast.success('Password updated successfully! You can now sign in.');
  window.location.href = '/auth';
  return true;
};

export const handleAuthCallback = async (
  accessToken: string | null,
  refreshToken: string | null,
  type: string | null
) => {
  if (!accessToken || !refreshToken) return;

  try {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });
    
    if (error) {
      console.error('Error setting session:', error);
      toast.error('Authentication failed. Please try again.');
      return;
    }

    if (type === 'email_confirmation') {
      await handleEmailConfirmation();
    } else if (type === 'recovery') {
      const params = new URLSearchParams(window.location.search);
      await handlePasswordReset(params.get('password'));
    }
  } catch (error) {
    console.error('Error during authentication callback:', error);
    toast.error('Authentication failed. Please try again.');
  }
};