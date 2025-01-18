import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface TrialBannerProps {
  daysLeft: number;
}

export function TrialBanner({ daysLeft }: TrialBannerProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_status')
          .eq('id', session.user.id)
          .single();

        setIsSubscribed(profile?.subscription_status === 'active');
      }
    };

    checkSubscriptionStatus();
  }, []);

  // Don't render anything if user is subscribed
  if (isSubscribed) {
    return null;
  }

  const handleUpgrade = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Error",
          description: "Please sign in to upgrade your subscription",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          priceId: 'price_1QVwHDFk4w8hjVcVAXnqBo0a',
          successUrl: `${window.location.origin}/dashboard`,
          cancelUrl: `${window.location.origin}/upgrade`,
        },
      });

      if (error) throw error;
      if (!data?.url) throw new Error('No checkout URL returned');

      window.location.href = data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: "Failed to start upgrade process. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-primary-foreground bg-primary px-3 py-1 rounded-full">
        {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left in trial
      </span>
      <Button 
        variant="secondary" 
        size="sm" 
        onClick={handleUpgrade}
      >
        Upgrade Now
      </Button>
    </div>
  );
}