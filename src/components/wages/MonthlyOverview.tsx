import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, TrendingUp } from "lucide-react";

interface MonthlyOverviewProps {
  monthlyBudget: number;
  currentCost: number;
  yearlyPrediction: number;
  currencySymbol: string;
}

export const MonthlyOverview = ({ 
  monthlyBudget, 
  currentCost, 
  yearlyPrediction,
  currencySymbol 
}: MonthlyOverviewProps) => {
  const isOverBudget = currentCost > monthlyBudget;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Monthly Budget</dt>
              <dd className="text-2xl font-bold">{currencySymbol}{monthlyBudget}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Current Cost</dt>
              <dd className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                {currencySymbol}{currentCost}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Yearly Prediction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{currencySymbol}{yearlyPrediction}</p>
          {isOverBudget && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Over Budget</AlertTitle>
              <AlertDescription>
                Current monthly cost exceeds the budget by {currencySymbol}{(currentCost - monthlyBudget).toFixed(2)}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};