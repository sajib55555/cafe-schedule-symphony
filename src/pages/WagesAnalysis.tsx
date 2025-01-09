import { useState } from "react";
import { Layout } from "@/components/Layout";
import { WageBudgetForm } from "@/components/wages/WageBudgetForm";
import { WagesStats } from "@/components/wages/WagesStats";
import { WagesChart } from "@/components/wages/WagesChart";
import { AIAdvice } from "@/components/wages/AIAdvice";
import { CurrencySelector } from "@/components/wages/CurrencySelector";
import { WagesHeader } from "@/components/wages/WagesHeader";
import { StaffWagesTable } from "@/components/wages/StaffWagesTable";
import { useWageData } from "@/hooks/useWageData";
import { useStaff } from "@/contexts/StaffContext";
import { Skeleton } from "@/components/ui/skeleton";

const WagesAnalysis = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const { monthlyBudget, setMonthlyBudget, currentCost, yearlyPrediction, isLoading } = useWageData(selectedMonth);
  const { staff } = useStaff();

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 space-y-8">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-8">
              <Skeleton className="h-[200px]" />
              <Skeleton className="h-[200px]" />
              <Skeleton className="h-[200px]" />
            </div>
            <div className="space-y-8">
              <Skeleton className="h-[200px]" />
              <Skeleton className="h-[200px]" />
            </div>
          </div>
          <Skeleton className="h-[400px]" />
        </div>
      </Layout>
    );
  }

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
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
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

        <div className="mt-8">
          <StaffWagesTable 
            staff={staff} 
            selectedMonth={selectedMonth}
          />
        </div>
      </div>
    </Layout>
  );
};

export default WagesAnalysis;