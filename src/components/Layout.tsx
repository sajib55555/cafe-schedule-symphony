import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays } from "date-fns";
import { Button } from "./ui/button";
import { TrialBanner } from "./layout/TrialBanner";
import { DollarSign, Settings, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

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

  const handleSignOut = async () => {
    if (isSigningOut) return;
    
    setIsSigningOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Success",
        description: "You have been signed out successfully.",
        variant: "default",
      });

      navigate("/auth");
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast({
        title: "Error",
        description: error.message || "An error occurred while signing out.",
        variant: "destructive",
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleWagesAnalysis = () => {
    navigate("/wages");
  };

  const handleSettings = () => {
    navigate("/settings");
  };

  return (
    <div className="min-h-screen bg-[#FDF6E3]">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-end gap-3">
          <Button 
            variant="secondary"
            onClick={handleWagesAnalysis}
            className="flex items-center gap-2"
          >
            <DollarSign className="h-4 w-4" />
            <span>Wages Analysis</span>
          </Button>
          <Button 
            variant="outline"
            onClick={handleSettings}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={handleSignOut} 
            disabled={isSigningOut}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span>{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
          </Button>
        </div>
      </div>
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
