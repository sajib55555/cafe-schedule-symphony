import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { format, addMonths, subMonths } from "date-fns";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface WagesStatsProps {
  monthlyBudget: number;
  currentCost: number;
  yearlyPrediction: number;
}

export const WagesStats = ({ monthlyBudget, currentCost, yearlyPrediction }: WagesStatsProps) => {
  const [currencySymbol, setCurrencySymbol] = useState("$");
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const { session } = useAuth();
  const isOverBudget = currentCost > monthlyBudget;

  useEffect(() => {
    const fetchCurrencySymbol = async () => {
      if (session?.user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('currency_symbol')
          .eq('id', session.user.id)
          .single();

        if (!error && data) {
          setCurrencySymbol(data.currency_symbol);
        }
      }
    };

    fetchCurrencySymbol();
  }, [session]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handlePreviousMonth = () => {
    setSelectedMonth(prevDate => subMonths(prevDate, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth(prevDate => addMonths(prevDate, 1));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Monthly Overview</CardTitle>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePreviousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium">
              {format(selectedMonth, 'MMMM yyyy')}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Current Cost</p>
              <p className="text-2xl font-bold">{currencySymbol}{formatCurrency(currentCost)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monthly Budget</p>
              <p className="text-2xl font-bold">{currencySymbol}{formatCurrency(monthlyBudget)}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Yearly Prediction</p>
            <p className="text-2xl font-bold flex items-center">
              <TrendingUp className="w-5 h-5 mr-1" />
              {currencySymbol}{formatCurrency(yearlyPrediction)}
            </p>
          </div>
        </CardContent>
      </Card>

      {isOverBudget && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Over Budget Warning</AlertTitle>
          <AlertDescription>
            Current monthly cost exceeds budget by {currencySymbol}{formatCurrency(currentCost - monthlyBudget)}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};