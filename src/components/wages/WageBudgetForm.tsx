import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WageBudgetFormProps {
  currentBudget: number;
  onUpdate: (newBudget: number) => void;
}

export const WageBudgetForm = ({ currentBudget, onUpdate }: WageBudgetFormProps) => {
  const [budget, setBudget] = useState(currentBudget.toString());
  const { session } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const numericBudget = parseFloat(budget);
      if (isNaN(numericBudget)) {
        throw new Error("Please enter a valid number");
      }

      const { error } = await supabase
        .from('wage_budgets')
        .upsert({
          monthly_budget: numericBudget,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      onUpdate(numericBudget);
      toast("Monthly budget updated successfully");
    } catch (error) {
      console.error('Error updating budget:', error);
      toast("Failed to update monthly budget. Please try again.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set Monthly Budget</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="Enter monthly budget"
              className="flex-1"
              step="0.01"
              min="0"
            />
            <Button type="submit">Update</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};