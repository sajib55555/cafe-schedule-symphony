import { Layout } from "@/components/Layout";
import { WagesHeader } from "@/components/wages/WagesHeader";
import { WagesStats } from "@/components/wages/WagesStats";
import { WagesChart } from "@/components/wages/WagesChart";
import { WageBudgetForm } from "@/components/wages/WageBudgetForm";
import { AIAdvice } from "@/components/wages/AIAdvice";
import { useWageData } from "@/hooks/useWageData";
import { Loader2 } from "lucide-react";

const WagesAnalysis = () => {
  const { monthlyBudget, setMonthlyBudget, currentCost, yearlyPrediction, isLoading } = useWageData();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  // Ensure we have default values to satisfy TypeScript
  const safeMonthlyBudget = monthlyBudget ?? 0;
  const safeCurrentCost = currentCost ?? 0;
  const safeYearlyPrediction = yearlyPrediction ?? 0;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <WagesHeader />
        <div className="mt-8">
          <WagesStats 
            monthlyBudget={safeMonthlyBudget}
            currentCost={safeCurrentCost}
            yearlyPrediction={safeYearlyPrediction}
          />
        </div>
        <div className="mt-8">
          <WagesChart 
            monthlyBudget={safeMonthlyBudget}
            currentCost={safeCurrentCost}
          />
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <WageBudgetForm 
            currentBudget={safeMonthlyBudget}
            onUpdate={setMonthlyBudget}
          />
          <AIAdvice 
            monthlyBudget={safeMonthlyBudget}
            currentCost={safeCurrentCost}
            yearlyPrediction={safeYearlyPrediction}
          />
        </div>
      </div>
    </Layout>
  );
};

export default WagesAnalysis;