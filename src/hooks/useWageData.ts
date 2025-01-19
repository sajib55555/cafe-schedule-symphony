import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, format, differenceInHours } from "date-fns";

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

        // Get all staff with their hourly pay
        const { data: staffData } = await supabase
          .from('staff')
          .select('id, hourly_pay');

        if (!staffData) return;

        // Get all shifts for the month
        const { data: shiftsData } = await supabase
          .from('shifts')
          .select('staff_id, start_time, end_time')
          .gte('start_time', format(monthStart, 'yyyy-MM-dd'))
          .lte('end_time', format(monthEnd, 'yyyy-MM-dd'));

        if (!shiftsData) return;

        // Calculate total cost
        let totalCost = 0;
        shiftsData.forEach(shift => {
          const staff = staffData.find(s => s.id === shift.staff_id);
          if (!staff) return;

          const hours = differenceInHours(
            new Date(shift.end_time),
            new Date(shift.start_time)
          );
          totalCost += hours * staff.hourly_pay;
        });

        setCurrentCost(totalCost);

        // Calculate yearly prediction based on average daily cost
        const daysInMonth = endOfMonth(selectedMonth).getDate();
        const dailyAverage = totalCost / daysInMonth;
        const yearlyEstimate = dailyAverage * 365;
        setYearlyPrediction(yearlyEstimate);

        // Update monthly_wages record
        await supabase
          .from('monthly_wages')
          .upsert({
            month_start: format(monthStart, 'yyyy-MM-dd'),
            month_end: format(monthEnd, 'yyyy-MM-dd'),
            total_wages: totalCost,
            updated_at: new Date().toISOString()
          });

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