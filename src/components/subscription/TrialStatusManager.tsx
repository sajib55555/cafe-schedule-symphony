import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays } from "date-fns";
import { TrialBanner } from "../layout/TrialBanner";

export function TrialStatusManager() {
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const checkTrialStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('trial_start, trial_end, subscription_status')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profile) {
          setIsSubscribed(profile.subscription_status === 'active');
          
          if (!isSubscribed && profile.trial_end) {
            const daysLeft = differenceInDays(new Date(profile.trial_end), new Date());
            setTrialDaysLeft(Math.max(0, daysLeft));
          }
        }
      }
    };

    checkTrialStatus();
  }, [isSubscribed]);

  if (!isSubscribed && trialDaysLeft !== null && trialDaysLeft >= 0) {
    return (
      <div className="bg-white border-b px-4 py-2">
        <div className="max-w-7xl mx-auto">
          <TrialBanner daysLeft={trialDaysLeft} />
        </div>
      </div>
    );
  }

  return null;
}