import { Layout } from "@/components/Layout";
import { WageBudgetForm } from "@/components/wages/WageBudgetForm";
import { WagesStats } from "@/components/wages/WagesStats";
import { WagesChart } from "@/components/wages/WagesChart";
import { AIAdvice } from "@/components/wages/AIAdvice";
import { CurrencySelector } from "@/components/wages/CurrencySelector";
import { WagesHeader } from "@/components/wages/WagesHeader";
import { useWageData } from "@/hooks/useWageData";

const WagesAnalysis = () => {
  const { monthlyBudget, setMonthlyBudget, currentCost, yearlyPrediction } = useWageData();

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <WagesHeader />
        
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-8">
            <CurrencySelector />
            <WageBudgetForm 
              currentBudget={monthlyBudget} 
              onUpdate={setMonthlyBudget} 
            />
            <WagesStats 
              monthlyBudget={monthlyBudget}
              currentCost={currentCost}
              yearlyPrediction={yearlyPrediction}
            />
          </div>
          
          <div className="space-y-8">
            <WagesChart 
              monthlyBudget={monthlyBudget}
              currentCost={currentCost}
            />
            <AIAdvice 
              monthlyBudget={monthlyBudget}
              currentCost={currentCost}
              yearlyPrediction={yearlyPrediction}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WagesAnalysis;