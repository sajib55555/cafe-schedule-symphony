import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const CTASection = () => {
  const navigate = useNavigate();
  
  const handleSignUp = () => {
    navigate('/auth', { state: { mode: 'signup' } });
  };

  return (
    <div className="bg-gradient-to-r from-primary/10 to-accent/10 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Ready to Transform Your Scheduling?
        </h2>
        <Button 
          size="lg"
          onClick={handleSignUp}
          className="bg-primary hover:bg-primary/90"
        >
          Start Your Free 30-Day Trial
        </Button>
        <p className="mt-4 text-sm text-gray-600">
          No credit card required • Full access to all features • Cancel anytime
        </p>
      </div>
    </div>
  );
};