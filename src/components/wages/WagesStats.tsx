import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, TrendingUp, DollarSign } from "lucide-react";

interface WagesStatsProps {
  monthlyBudget: number;
  currentCost: number;
  yearlyPrediction: number;
}

export const WagesStats = ({ monthlyBudget, currentCost, yearlyPrediction }: WagesStatsProps) => {
  const isOverBudget = currentCost > monthlyBudget;
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Current Cost</p>
              <p className="text-2xl font-bold flex items-center">
                <DollarSign className="w-5 h-5 mr-1" />
                {formatCurrency(currentCost)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monthly Budget</p>
              <p className="text-2xl font-bold flex items-center">
                <DollarSign className="w-5 h-5 mr-1" />
                {formatCurrency(monthlyBudget)}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Yearly Prediction</p>
            <p className="text-2xl font-bold flex items-center">
              <TrendingUp className="w-5 h-5 mr-1" />
              {formatCurrency(yearlyPrediction)}
            </p>
          </div>
        </CardContent>
      </Card>

      {isOverBudget && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Over Budget Warning</AlertTitle>
          <AlertDescription>
            Current monthly cost exceeds budget by {formatCurrency(currentCost - monthlyBudget)}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};