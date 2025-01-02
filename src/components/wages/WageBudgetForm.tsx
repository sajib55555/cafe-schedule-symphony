import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WageBudgetFormProps {
  currentBudget: number;
  onUpdate: (newBudget: number) => void;
}

export const WageBudgetForm = ({ currentBudget, onUpdate }: WageBudgetFormProps) => {
  const [budget, setBudget] = useState(currentBudget?.toString() || "0");
  const [hasCompany, setHasCompany] = useState(true);
  const { session } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (currentBudget !== undefined) {
      setBudget(currentBudget.toString());
    }
  }, [currentBudget]);

  useEffect(() => {
    const checkCompany = async () => {
      if (!session?.user?.id) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', session.user.id)
        .single();

      setHasCompany(!!profile?.company_id);
    };

    checkCompany();
  }, [session?.user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasCompany) {
      toast({
        title: "Error",
        description: "You need to be part of a company to set a budget. Please contact your administrator.",
        variant: "destructive",
      });
      return;
    }

    try {
      const numericBudget = parseFloat(budget);
      if (isNaN(numericBudget)) {
        throw new Error("Please enter a valid number");
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', session?.user.id)
        .maybeSingle();

      if (!profile?.company_id) {
        toast({
          title: "Error",
          description: "Company not found. Please make sure you're part of a company.",
          variant: "destructive",
        });
        return;
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
        description: "Failed to update monthly budget. Please try again.",
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
        {!hasCompany && (
          <Alert className="mb-4">
            <AlertDescription>
              You need to be part of a company to set a budget. Please contact your administrator.
            </AlertDescription>
          </Alert>
        )}
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
              disabled={!hasCompany}
            />
            <Button type="submit" disabled={!hasCompany}>Update</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};