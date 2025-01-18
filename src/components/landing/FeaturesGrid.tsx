import { CalendarDays, Clock, Users, Wallet, BarChart3, Shield } from "lucide-react";
import { FeatureCard } from "./FeatureCard";

export const FeaturesGrid = () => {
  return (
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
  );
};