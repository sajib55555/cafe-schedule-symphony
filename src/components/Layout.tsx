import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays } from "date-fns";
import { Header } from "./layout/Header";
import { TrialBanner } from "./layout/TrialBanner";

export function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const checkTrialStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('trial_end, subscription_status')
          .eq('id', session.user.id)
          .single();

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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        checkTrialStatus();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, isSubscribed]);

  return (
    <div className="min-h-screen bg-[#FDF6E3]">
      <Header />
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