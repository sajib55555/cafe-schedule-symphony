import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays } from "date-fns";
import { TrialBanner } from "./layout/TrialBanner";
import { NavigationBar } from "./layout/NavigationBar";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function Layout({ children }: { children: React.ReactNode }) {
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkTrialStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          console.log('No session found, redirecting to auth');
          navigate("/auth");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          if (profileError.message?.includes('JWT expired')) {
            // Clear session and redirect on JWT expiration
            await supabase.auth.signOut();
            localStorage.clear();
            navigate("/auth");
            return;
          }
          toast.error('Error checking subscription status');
          return;
        }

        if (!profile) {
          console.log('No profile found, creating new profile');
          const { error: createError } = await supabase
            .from('profiles')
            .insert([{
              id: session.user.id,
              email: session.user.email,
              trial_start: new Date().toISOString(),
              trial_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
              subscription_status: 'trial',
              role: 'staff',
              currency_symbol: '$'
            }]);

          if (createError) {
            console.error('Error creating profile:', createError);
            toast.error('Error creating user profile');
            return;
          }

          setIsSubscribed(false);
          setTrialDaysLeft(14);
          return;
        }

        setIsSubscribed(profile.subscription_status === 'active');
        
        if (!isSubscribed && profile.trial_end) {
          const daysLeft = differenceInDays(new Date(profile.trial_end), new Date());
          setTrialDaysLeft(Math.max(0, daysLeft));
        }
      } catch (error: any) {
        console.error('Error in checkTrialStatus:', error);
        // Handle JWT expiration and network errors
        if (error.message?.includes('JWT expired') || error.message?.includes('Failed to fetch')) {
          await supabase.auth.signOut();
          localStorage.clear();
          navigate("/auth");
          return;
        }
        toast.error('Error checking subscription status');
      }
    };

    checkTrialStatus();
  }, [isSubscribed, navigate]);

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