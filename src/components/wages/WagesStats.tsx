import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { MonthlyOverview } from "./MonthlyOverview";
import { MonthNavigation } from "./MonthNavigation";

interface WagesStatsProps {
  monthlyBudget: number;
  currentCost: number;
  yearlyPrediction: number;
  selectedMonth: Date;
  onMonthChange: Dispatch<SetStateAction<Date>>;
}

export const WagesStats = ({ 
  monthlyBudget, 
  currentCost, 
  yearlyPrediction,
  selectedMonth,
  onMonthChange 
}: WagesStatsProps) => {
  const [currencySymbol, setCurrencySymbol] = useState("$");
  const { session } = useAuth();

  // Fetch currency symbol
  useEffect(() => {
    const fetchCurrencySymbol = async () => {
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('currency_symbol')
          .eq('id', session.user.id)
          .single();

        if (data?.currency_symbol) {
          setCurrencySymbol(data.currency_symbol);
        }
      }
    };

    fetchCurrencySymbol();
  }, [session]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Monthly Overview</CardTitle>
        <MonthNavigation 
          selectedMonth={selectedMonth}
          onMonthChange={onMonthChange}
        />
      </CardHeader>
      <CardContent>
        <MonthlyOverview
          monthlyBudget={monthlyBudget}
          currentCost={currentCost}
          yearlyPrediction={yearlyPrediction}
          currencySymbol={currencySymbol}
        />
      </CardContent>
    </Card>
  );
};