import { Layout } from "@/components/Layout";
import { WageBudgetForm } from "@/components/wages/WageBudgetForm";
import { WagesStats } from "@/components/wages/WagesStats";
import { WagesChart } from "@/components/wages/WagesChart";
import { AIAdvice } from "@/components/wages/AIAdvice";
import { CurrencySelector } from "@/components/wages/CurrencySelector";
import { useWageData } from "@/hooks/useWageData";
import { useStaff } from "@/contexts/StaffContext";

const WagesAnalysis = () => {
  const { monthlyBudget, setMonthlyBudget, currentCost, yearlyPrediction } = useWageData();
  const { staff } = useStaff();

  // Calculate total monthly wages
  const totalMonthlyWages = staff.reduce((total, employee) => {
    return total + (employee.hours * (employee.hourly_pay || 0));
  }, 0);

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-8">
            <CurrencySelector />
            <WageBudgetForm 
              currentBudget={monthlyBudget} 
              onUpdate={setMonthlyBudget} 
            />
            <WagesStats 
              monthlyBudget={monthlyBudget}
              currentCost={totalMonthlyWages}
              yearlyPrediction={totalMonthlyWages * 12}
            />
          </div>
          
          <div className="space-y-8">
            <WagesChart 
              monthlyBudget={monthlyBudget}
              currentCost={totalMonthlyWages}
            />
            <AIAdvice 
              monthlyBudget={monthlyBudget}
              currentCost={totalMonthlyWages}
              yearlyPrediction={totalMonthlyWages * 12}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WagesAnalysis;