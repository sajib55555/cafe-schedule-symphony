import { Layout } from "@/components/Layout";
import SubscriptionHeader from "@/components/subscription/SubscriptionHeader";
import SubscriptionActions from "@/components/subscription/SubscriptionActions";

const Subscription = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <SubscriptionHeader />
        <SubscriptionActions />
      </div>
    </Layout>
  );
};

export default Subscription;