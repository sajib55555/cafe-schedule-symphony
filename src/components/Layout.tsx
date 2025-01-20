import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays } from "date-fns";
import { TrialBanner } from "./layout/TrialBanner";
import { NavigationBar } from "./layout/NavigationBar";

export function Layout({ children }: { children: React.ReactNode }) {
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkTrialStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setIsLoading(false);
          return;
        }

        // First check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('trial_end, subscription_status, company_id')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setIsLoading(false);
          return;
        }

        // If no profile found, don't show trial banner
        if (!profile) {
          setIsLoading(false);
          return;
        }

        const isActiveSubscription = profile.subscription_status === 'active';
        setIsSubscribed(isActiveSubscription);
        
        if (!isActiveSubscription && profile.trial_end) {
          const daysLeft = differenceInDays(new Date(profile.trial_end), new Date());
          setTrialDaysLeft(Math.max(0, daysLeft));
        }
      } catch (error) {
        console.error('Error in checkTrialStatus:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkTrialStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDF6E3] flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF6E3]">
      <NavigationBar />
      {!isSubscribed && trialDaysLeft !== null && trialDaysLeft >= 0 && (
        <div className="bg-white border-b px-4 py-2">
          <div className="max-w-7xl mx-auto">
            <TrialBanner daysLeft={trialDaysLeft} />
          </div>
        </div>
      )}
      <div className="pt-4">
        {children}
      </div>
    </div>
  );
}