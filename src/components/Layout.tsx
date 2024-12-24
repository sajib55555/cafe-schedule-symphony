import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays } from "date-fns";
import { Header } from "./layout/Header";
import { TrialBanner } from "./layout/TrialBanner";

export function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkTrialStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user || !mounted) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('trial_end')
          .eq('id', session.user.id)
          .single();

        if (profile?.trial_end && mounted) {
          const daysLeft = differenceInDays(new Date(profile.trial_end), new Date());
          setTrialDaysLeft(Math.max(0, daysLeft));
          console.log('Trial days left:', daysLeft);
        }
      } catch (error) {
        console.error('Error checking trial status:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkTrialStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed in Layout:', event, session);
      if (!mounted) return;
      
      if (!session) {
        navigate("/auth");
      } else {
        await checkTrialStatus();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDF6E3] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF6E3] flex flex-col">
      <Header />
      {trialDaysLeft !== null && trialDaysLeft >= 0 && (
        <div className="bg-white border-b px-4 py-2">
          <div className="max-w-7xl mx-auto">
            <TrialBanner daysLeft={trialDaysLeft} />
          </div>
        </div>
      )}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}