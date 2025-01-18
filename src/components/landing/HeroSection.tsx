import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const HeroSection = () => {
  const navigate = useNavigate();
  
  const handleSignUp = () => {
    navigate('/auth', { state: { mode: 'signup' } });
  };

  return (
    <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
            Simplify Your Staff Scheduling
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Create efficient work schedules, manage staff availability, and optimize labor costs with our intuitive scheduling platform.
          </p>
          <Button 
            size="lg"
            onClick={handleSignUp}
            className="bg-primary hover:bg-primary/90"
          >
            Start Your Free Trial <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};