import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Clock, Users, Wallet, ArrowRight, BarChart3, Shield } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                EasyRotas
              </div>
            </div>
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-primary hover:bg-primary/90"
            >
              Try EasyRotas For Free
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
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
              onClick={() => navigate('/auth')}
              className="bg-primary hover:bg-primary/90"
            >
              Start Your Free Trial <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              Everything You Need to Manage Your Team
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<CalendarDays className="h-8 w-8 text-primary" />}
              title="Smart Scheduling"
              description="AI-powered scheduling that considers staff availability, skills, and labor laws."
            />
            <FeatureCard
              icon={<Users className="h-8 w-8 text-primary" />}
              title="Team Management"
              description="Easily manage staff profiles, availability, and time-off requests in one place."
            />
            <FeatureCard
              icon={<Clock className="h-8 w-8 text-primary" />}
              title="Real-time Updates"
              description="Instant schedule updates and notifications keep everyone in sync."
            />
            <FeatureCard
              icon={<Wallet className="h-8 w-8 text-primary" />}
              title="Cost Control"
              description="Track labor costs and optimize scheduling to stay within budget."
            />
            <FeatureCard
              icon={<BarChart3 className="h-8 w-8 text-primary" />}
              title="Analytics & Reports"
              description="Gain insights into scheduling patterns and labor costs with detailed reports."
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8 text-primary" />}
              title="Compliance"
              description="Built-in rules ensure schedules comply with labor laws and company policies."
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Ready to Transform Your Scheduling?
          </h2>
          <Button 
            size="lg"
            onClick={() => navigate('/auth')}
            className="bg-primary hover:bg-primary/90"
          >
            Start Your Free 30-Day Trial
          </Button>
          <p className="mt-4 text-sm text-gray-600">
            No credit card required • Full access to all features • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
}) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow duration-200">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default LandingPage;