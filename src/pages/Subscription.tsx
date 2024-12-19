import SubscriptionHeader from "@/components/subscription/SubscriptionHeader";
import SubscriptionActions from "@/components/subscription/SubscriptionActions";

const Subscription = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <SubscriptionHeader />
        <SubscriptionActions />
      </div>
    </div>
  );
};

export default Subscription;