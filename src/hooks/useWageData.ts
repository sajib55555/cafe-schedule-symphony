import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, format } from "date-fns";

export const useWageData = (selectedMonth: Date = new Date()) => {
  const [monthlyBudget, setMonthlyBudget] = useState<number>(0);
  const [currentCost, setCurrentCost] = useState<number>(0);
  const [yearlyPrediction, setYearlyPrediction] = useState<number>(0);
  const { session } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const loadWageData = async () => {
      try {
        if (!session?.user?.id) return;

        // Get monthly budget from wage_budgets table
        const { data: budgetData } = await supabase
          .from('wage_budgets')
          .select('monthly_budget')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        setMonthlyBudget(budgetData?.monthly_budget || 0);

        // Calculate total cost for the selected month
        const monthStart = startOfMonth(selectedMonth);
        const monthEnd = endOfMonth(selectedMonth);

        const { data: monthlyWages } = await supabase
          .from('monthly_wages')
          .select('total_wages')
          .gte('month_start', format(monthStart, 'yyyy-MM-dd'))
          .lte('month_end', format(monthEnd, 'yyyy-MM-dd'));

        const totalCost = monthlyWages?.reduce((sum, record) => sum + (record.total_wages || 0), 0) || 0;
        setCurrentCost(totalCost);

        // Calculate yearly prediction based on current month
        setYearlyPrediction(totalCost * 12);
      } catch (error) {
        console.error('Error loading wage data:', error);
        toast({
          title: "Error",
          description: "Failed to load wage data",
          variant: "destructive",
        });
      }
    };

    loadWageData();
  }, [session, selectedMonth, toast]);

  return {
    monthlyBudget,
    setMonthlyBudget,
    currentCost,
    yearlyPrediction
  };
};