import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const handleEmailConfirmation = async () => {
  try {
    console.log('Handling email confirmation');
    toast.success('Email confirmed successfully! You can now sign in.');
    window.location.href = '/auth';
  } catch (error) {
    console.error('Error during email confirmation:', error);
    toast.error('Failed to confirm email. Please try again.');
  }
};

export const handlePasswordReset = async (accessToken: string) => {
  try {
    console.log('Handling password reset with access token');
    const { error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      throw error;
    }

    // Redirect to password reset form
    window.location.href = `/auth?type=recovery&access_token=${accessToken}`;
    return true;
  } catch (error) {
    console.error('Error during password reset:', error);
    toast.error('Failed to process password reset. Please try again.');
    return false;
  }
};

export const handleAuthCallback = async (
  accessToken: string | null,
  type: string | null
) => {
  console.log('Handling auth callback:', { type });
  
  if (!accessToken) {
    console.error('Missing access token in auth callback');
    toast.error('Authentication failed. Please try again.');
    return;
  }

  try {
    if (type === 'recovery') {
      await handlePasswordReset(accessToken);
    } else if (type === 'email_confirmation') {
      await handleEmailConfirmation();
    }
  } catch (error) {
    console.error('Error during authentication callback:', error);
    toast.error('Authentication failed. Please try again.');
  }
};