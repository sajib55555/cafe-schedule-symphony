import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const UpgradePage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

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

      const response = await fetch('/functions/v1/create-checkout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: 'price_1QVwHDFk4w8hjVcVAXnqBo0a',
        }),
      });

      const { url, error } = await response.json();
      
      if (error) throw new Error(error);
      if (!url) throw new Error('No checkout URL returned');

      window.location.href = url;
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
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Upgrade Your Plan</h1>
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
    </div>
  );
};

export default UpgradePage;