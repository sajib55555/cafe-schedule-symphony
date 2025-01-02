import { Layout } from "@/components/Layout";
import { WagesHeader } from "@/components/wages/WagesHeader";
import { WagesStats } from "@/components/wages/WagesStats";
import { WagesChart } from "@/components/wages/WagesChart";
import { WageBudgetForm } from "@/components/wages/WageBudgetForm";
import { AIAdvice } from "@/components/wages/AIAdvice";

const WagesAnalysis = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <WagesHeader />
        <div className="mt-8">
          <WagesStats />
        </div>
        <div className="mt-8">
          <WagesChart />
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <WageBudgetForm />
          <AIAdvice />
        </div>
      </div>
    </Layout>
  );
};

export default WagesAnalysis;