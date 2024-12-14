import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SubscriptionPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        navigate("/auth");
        return;
      }

      // Check if user already has an active trial
      const { data: profile } = await supabase
        .from('profiles')
        .select('trial_start, trial_end')
        .eq('id', session.user.id)
        .single();

      if (profile?.trial_end && new Date(profile.trial_end) > new Date()) {
        navigate("/");
        toast({
          title: "Active Trial",
          description: "You already have an active trial. Redirecting to dashboard.",
        });
      }
    };

    checkSession();
  }, [navigate, toast]);

  const handleStartTrial = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "Please sign in to start your trial.",
          variant: "destructive",
        });
        return;
      }

      const trialStart = new Date();
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 30); // 30 days trial

      const { error } = await supabase
        .from('profiles')
        .update({
          trial_start: trialStart.toISOString(),
          trial_end: trialEnd.toISOString(),
        })
        .eq('id', session.user.id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your 30-day free trial has been activated.",
      });
      navigate("/");
    } catch (error) {
      console.error('Error starting trial:', error);
      toast({
        title: "Error",
        description: "Failed to start your trial. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF6E3] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Start Your Journey</h1>
          <p className="text-xl text-gray-600 mb-8">Try our complete café management solution risk-free</p>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="p-8 bg-white shadow-lg rounded-lg border-primary">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">30-Day Free Trial</h2>
            <p className="text-gray-600 mb-4">Experience all premium features</p>
            <div className="mb-6">
              <p className="text-4xl font-bold text-gray-900">£0</p>
              <p className="text-gray-600">for 30 days</p>
            </div>
            <ul className="mb-8 space-y-4">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Full access to all features
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
                No credit card required
              </li>
            </ul>
            <Button 
              className="w-full"
              onClick={handleStartTrial}
              disabled={isLoading}
            >
              {isLoading ? "Starting trial..." : "Start Free Trial"}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}