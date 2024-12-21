import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
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
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const numericBudget = parseFloat(budget);
      if (isNaN(numericBudget)) {
        throw new Error("Please enter a valid number");
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', session?.user.id)
        .single();

      if (!profile?.company_id) {
        throw new Error("Company ID not found");
      }

      const { error } = await supabase
        .from('wage_budgets')
        .upsert({
          company_id: profile.company_id,
          monthly_budget: numericBudget,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      onUpdate(numericBudget);
      toast({
        title: "Success",
        description: "Monthly budget updated successfully",
      });
    } catch (error) {
      console.error('Error updating budget:', error);
      toast({
        title: "Error",
        description: "Failed to update monthly budget",
        variant: "destructive",
      });
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