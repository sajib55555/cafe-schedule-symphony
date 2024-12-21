import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { WageBudgetForm } from "@/components/wages/WageBudgetForm";
import { WagesStats } from "@/components/wages/WagesStats";
import { WagesChart } from "@/components/wages/WagesChart";
import { AIAdvice } from "@/components/wages/AIAdvice";
import { CurrencySelector } from "@/components/wages/CurrencySelector";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";

const WagesAnalysis = () => {
  const [monthlyBudget, setMonthlyBudget] = useState<number>(0);
  const [currentCost, setCurrentCost] = useState<number>(0);
  const [yearlyPrediction, setYearlyPrediction] = useState<number>(0);
  const { session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleBackToIndex = () => {
    navigate("/dashboard");
  };

  useEffect(() => {
    const loadWageData = async () => {
      try {
        // Get company ID from user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', session?.user.id)
          .single();

        if (profile?.company_id) {
          // Load wage budget
          const { data: budget } = await supabase
            .from('wage_budgets')
            .select('monthly_budget')
            .eq('company_id', profile.company_id)
            .single();

          if (budget) {
            setMonthlyBudget(budget.monthly_budget);
          }

          // Calculate current month's cost
          const { data: staff } = await supabase
            .from('staff')
            .select('hours, hourly_pay');

          const totalCost = staff?.reduce((acc, curr) => {
            return acc + (curr.hours || 0) * (curr.hourly_pay || 0);
          }, 0) || 0;

          setCurrentCost(totalCost);
          setYearlyPrediction(totalCost * 12); // Simple yearly prediction
        }
      } catch (error) {
        console.error('Error loading wage data:', error);
        toast({
          title: "Error",
          description: "Failed to load wage data",
          variant: "destructive",
        });
      }
    };

    if (session?.user) {
      loadWageData();
    }
  }, [session, toast]);

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Staff Wages Analysis</h1>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleBackToIndex}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        
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