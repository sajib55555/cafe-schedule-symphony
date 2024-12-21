import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useWageData = () => {
  const [monthlyBudget, setMonthlyBudget] = useState<number>(0);
  const [currentCost, setCurrentCost] = useState<number>(0);
  const [yearlyPrediction, setYearlyPrediction] = useState<number>(0);
  const { session } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const loadWageData = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', session?.user.id)
          .single();

        if (profile?.company_id) {
          const { data: budget } = await supabase
            .from('wage_budgets')
            .select('monthly_budget')
            .eq('company_id', profile.company_id)
            .single();

          if (budget) {
            setMonthlyBudget(budget.monthly_budget);
          }

          const { data: staff } = await supabase
            .from('staff')
            .select('hours, hourly_pay');

          const totalCost = staff?.reduce((acc, curr) => {
            return acc + (curr.hours || 0) * (curr.hourly_pay || 0);
          }, 0) || 0;

          setCurrentCost(totalCost);
          setYearlyPrediction(totalCost * 12);
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

  return {
    monthlyBudget,
    setMonthlyBudget,
    currentCost,
    yearlyPrediction
  };
};