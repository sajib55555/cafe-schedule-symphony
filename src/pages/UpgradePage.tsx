import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const UpgradePage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get('payment_status');
      
      if (paymentStatus === 'success') {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session) {
            console.error('No session found after payment success');
            return;
          }

          // Update the profile subscription status
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              subscription_status: 'active',
            })
            .eq('id', session.user.id);

          if (updateError) {
            console.error('Error updating subscription status:', updateError);
            toast({
              title: "Error",
              description: "There was a problem activating your subscription. Please contact support.",
              variant: "destructive",
            });
            return;
          }

          toast({
            title: "Subscription Activated",
            description: "Thank you for upgrading! You now have full access.",
          });
          
          // Add a small delay to ensure the toast is visible
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 1000);
        } catch (error: any) {
          console.error('Error handling payment success:', error);
          toast({
            title: "Error",
            description: "There was a problem processing your payment. Please contact support.",
            variant: "destructive",
          });
        }
      }
    };

    handlePaymentSuccess();
  }, [navigate, toast]);

  const handleUpgrade = async () => {
    try {
      setLoading(true);
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
          successUrl: `${window.location.origin}/upgrade?payment_status=success`,
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Upgrade Your Plan</h2>
        <p className="text-xl text-muted-foreground">
          Get full access to all features and start managing your schedule effectively
        </p>
      </div>

      <div className="bg-card rounded-lg shadow-lg p-8 max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="text-4xl font-bold mb-2">£9.95<span className="text-lg font-normal">/month</span></div>
          <p className="text-muted-foreground">Full access to all features</p>
        </div>

        <ul className="space-y-4 mb-8">
          <li className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            Unlimited staff management
          </li>
          <li className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            Advanced scheduling features
          </li>
          <li className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            Export schedules to PDF
          </li>
        </ul>

        <Button 
          className="w-full" 
          size="lg"
          onClick={handleUpgrade}
          disabled={loading}
        >
          {loading ? "Processing..." : "Upgrade Now"}
        </Button>
      </div>
    </div>
  );
};

export default UpgradePage;