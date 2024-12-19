import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Subscription = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const startTrial = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast({
          title: "Error",
          description: "Please sign in to start your trial",
          variant: "destructive",
        });
        return;
      }

      // Check if user already has an active trial
      const { data: profile } = await supabase
        .from('profiles')
        .select('trial_start, trial_end')
        .eq('id', session.user.id)
        .single();

      if (profile?.trial_end && new Date(profile.trial_end) > new Date()) {
        toast({
          title: "Trial already active",
          description: "You already have an active trial",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      // Set trial period (30 days)
      const trialStart = new Date();
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 30);

      const { error } = await supabase
        .from('profiles')
        .update({
          trial_start: trialStart.toISOString(),
          trial_end: trialEnd.toISOString(),
        })
        .eq('id', session.user.id);

      if (error) throw error;

      toast({
        title: "Trial activated!",
        description: "Your 30-day free trial has started",
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error starting trial:', error);
      toast({
        title: "Error",
        description: "Failed to start trial. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <h1 className="text-5xl font-bold mb-6">
          Streamline Your Staff Management
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          The all-in-one solution for employee scheduling, time tracking, and workforce management.
        </p>
        <Button
          size="lg"
          onClick={startTrial}
          disabled={loading}
          className="text-lg px-8"
        >
          {loading ? "Starting trial..." : "Start 30-Day Free Trial"}
        </Button>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need to Manage Your Team
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              title="Smart Scheduling"
              description="Create and manage employee schedules with ease. Drag-and-drop interface, templates, and automatic conflict detection."
            />
            <FeatureCard
              title="Time & Attendance"
              description="Track employee hours, breaks, and overtime. Generate accurate timesheets automatically."
            />
            <FeatureCard
              title="Team Communication"
              description="Keep everyone on the same page with built-in messaging, shift swapping, and announcements."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">Simple, Transparent Pricing</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <PricingCard
              title="Free Trial"
              price="$0"
              duration="30 days"
              features={[
                "Full access to all features",
                "Unlimited employees",
                "24/7 support",
                "No credit card required",
              ]}
              buttonText="Start Free Trial"
              onClick={startTrial}
              loading={loading}
            />
            <PricingCard
              title="Premium"
              price="$5"
              duration="per user/month"
              features={[
                "Everything in Free Trial",
                "Priority support",
                "Advanced reporting",
                "API access",
              ]}
              buttonText="Contact Sales"
              onClick={() => window.location.href = 'mailto:sales@example.com'}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ title, description }: { title: string; description: string }) => (
  <div className="p-6 rounded-lg bg-background border">
    <h3 className="text-xl font-semibold mb-3">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

const PricingCard = ({
  title,
  price,
  duration,
  features,
  buttonText,
  onClick,
  loading,
}: {
  title: string;
  price: string;
  duration: string;
  features: string[];
  buttonText: string;
  onClick: () => void;
  loading?: boolean;
}) => (
  <div className="p-8 rounded-lg border bg-background">
    <h3 className="text-2xl font-bold mb-2">{title}</h3>
    <div className="mb-6">
      <span className="text-4xl font-bold">{price}</span>
      <span className="text-muted-foreground">/{duration}</span>
    </div>
    <ul className="space-y-3 mb-8">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          {feature}
        </li>
      ))}
    </ul>
    <Button
      className="w-full"
      size="lg"
      onClick={onClick}
      disabled={loading}
    >
      {loading ? "Processing..." : buttonText}
    </Button>
  </div>
);

export default Subscription;