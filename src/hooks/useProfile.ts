import { supabase } from "@/integrations/supabase/client";

export const useProfile = () => {
  const fetchProfile = async (userId: string) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('trial_start, trial_end, subscription_status')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return profile;
  };

  return { fetchProfile };
};