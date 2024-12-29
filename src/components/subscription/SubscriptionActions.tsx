import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const SubscriptionActions = () => {
  const navigate = useNavigate();
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

  if (isSubscribed) {
    return null;
  }

  return (
    <div className="bg-card rounded-lg shadow-lg p-8 max-w-md mx-auto">
      <Button 
        className="w-full" 
        size="lg"
        onClick={() => navigate('/upgrade')}
      >
        View Plans & Upgrade
      </Button>
    </div>
  );
};

export default SubscriptionActions;