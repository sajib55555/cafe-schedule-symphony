import { supabase } from "@/integrations/supabase/client";

export const getSessionStatus = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  console.log('Session status check:', session);
  return session;
};

export const checkTrialStatus = (profile: any) => {
  const now = new Date();
  const trialEnd = profile.trial_end ? new Date(profile.trial_end) : null;
  
  const hasActiveSubscription = profile.subscription_status === 'active';
  const hasActiveTrial = trialEnd ? now <= trialEnd : false;
  
  console.log('Trial status check:', {
    trialEnd,
    now,
    hasActiveSubscription,
    hasActiveTrial
  });
  
  return {
    hasAccess: hasActiveSubscription || hasActiveTrial,
    trialEnded: !hasActiveSubscription && trialEnd && now > trialEnd
  };
};