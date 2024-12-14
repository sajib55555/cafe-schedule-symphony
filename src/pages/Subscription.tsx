import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function SubscriptionPage() {
  const { toast } = useToast();

  const handleSubscribe = async (priceId: string) => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Failed to get session');
      }

      if (!session) {
        toast({
          title: "Error",
          description: "Please sign in to subscribe",
          variant: "destructive",
        });
        return;
      }

      console.log('Session found:', session.access_token);

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to start subscription process",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF6E3] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 mb-8">Select the perfect plan for your café management needs</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Trial Plan */}
          <Card className="p-8 bg-white shadow-lg rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14-Day Free Trial</h2>
            <p className="text-gray-600 mb-4">Perfect for trying out our features</p>
            <div className="mb-6">
              <p className="text-4xl font-bold text-gray-900">£0</p>
              <p className="text-gray-600">for 14 days</p>
            </div>
            <ul className="mb-8 space-y-4">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Full access to all features
              </li>
            </ul>
            <Button 
              className="w-full"
              onClick={() => handleSubscribe('price_1QVwHDFk4w8hjVcVAXnqBo0a')}
            >
              Start Free Trial
            </Button>
          </Card>

          {/* Premium Plan */}
          <Card className="p-8 bg-white shadow-lg rounded-lg border-primary">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Premium Plan</h2>
            <p className="text-gray-600 mb-4">For established cafés</p>
            <div className="mb-6">
              <p className="text-4xl font-bold text-gray-900">£9.95</p>
              <p className="text-gray-600">per month</p>
            </div>
            <ul className="mb-8 space-y-4">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                All features included
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Priority support
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Advanced analytics
              </li>
            </ul>
            <Button 
              className="w-full"
              onClick={() => handleSubscribe('price_1QVwHDFk4w8hjVcVAXnqBo0a')}
            >
              Upgrade to Premium
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}