import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

interface WagesChartProps {
  monthlyBudget: number;
  currentCost: number;
}

export const WagesChart = ({ monthlyBudget, currentCost }: WagesChartProps) => {
  const data = [
    {
      name: "Monthly Comparison",
      budget: monthlyBudget,
      actual: currentCost,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget vs Actual Cost</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer
            config={{
              budget: { color: "#10B981" },
              actual: { color: currentCost > monthlyBudget ? "#EF4444" : "#3B82F6" },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip />
                <Bar dataKey="budget" name="Budget" fill="var(--color-budget)" />
                <Bar dataKey="actual" name="Actual" fill="var(--color-actual)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};