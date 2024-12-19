import { SignUpForm } from "@/components/SignUpForm";

const Subscription = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <h1 className="text-5xl font-bold mb-6">
          Streamline Your Staff Management
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of businesses that trust us with their scheduling needs. Start your 30-day free trial today.
        </p>
      </section>

      {/* Sign Up Form Section */}
      <section className="py-16 px-4">
        <div className="max-w-md mx-auto bg-card p-8 rounded-lg shadow-lg border">
          <h2 className="text-2xl font-bold text-center mb-8">Start Your Free Trial</h2>
          <SignUpForm />
        </div>
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
              description="Create and manage employee schedules with ease. Our intuitive drag-and-drop interface makes scheduling a breeze."
            />
            <FeatureCard
              title="Time & Attendance"
              description="Track employee hours, breaks, and overtime automatically. Generate accurate timesheets with one click."
            />
            <FeatureCard
              title="Team Communication"
              description="Keep everyone on the same page with built-in messaging, shift swapping, and announcements."
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <BenefitCard
              title="Save Time"
              description="Reduce scheduling time by up to 80% with our automated tools"
            />
            <BenefitCard
              title="Reduce Costs"
              description="Cut labor costs by optimizing schedules and preventing overtime"
            />
            <BenefitCard
              title="Improve Compliance"
              description="Stay compliant with labor laws and industry regulations"
            />
            <BenefitCard
              title="Boost Productivity"
              description="Increase team efficiency with better schedule management"
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

const BenefitCard = ({ title, description }: { title: string; description: string }) => (
  <div className="text-center p-6">
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

export default Subscription;