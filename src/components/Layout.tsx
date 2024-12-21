import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { useToast } from "@/components/ui/use-toast";
import { differenceInDays } from "date-fns";

export function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    const checkTrialStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('trial_end')
          .eq('id', session.user.id)
          .single();

        if (profile?.trial_end) {
          const daysLeft = differenceInDays(new Date(profile.trial_end), new Date());
          setTrialDaysLeft(Math.max(0, daysLeft));
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
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        navigate("/auth");
        return;
      }

      if (!session) {
        navigate("/auth");
        return;
      }

      const { error } = await supabase.auth.signOut();
      
      if (error) {
        if (error.message.includes('session_not_found')) {
          console.log('Session not found, redirecting to auth page');
          navigate("/auth");
          return;
        }
        throw error;
      }

      navigate("/auth");
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast({
        title: "Notice",
        description: "You have been signed out.",
        variant: "default",
      });
      navigate("/auth");
    }
  };

  const handleUpgrade = () => {
    navigate("/subscription");
  };

  return (
    <div className="min-h-screen bg-[#FDF6E3]">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-secondary">Café Schedule Manager</h1>
            {trialDaysLeft !== null && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-primary-foreground bg-primary px-3 py-1 rounded-full">
                  {trialDaysLeft} {trialDaysLeft === 1 ? 'day' : 'days'} left in trial
                </span>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={handleUpgrade}
                >
                  Upgrade Now
                </Button>
              </div>
            )}
          </div>
          <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
        </div>
      </header>
      {children}
    </div>
  );
}