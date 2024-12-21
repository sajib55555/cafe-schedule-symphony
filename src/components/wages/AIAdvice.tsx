import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AIAdviceProps {
  monthlyBudget: number;
  currentCost: number;
  yearlyPrediction: number;
}

export const AIAdvice = ({ monthlyBudget, currentCost, yearlyPrediction }: AIAdviceProps) => {
  const [advice, setAdvice] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getAIAdvice = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-wage-advice', {
        body: {
          monthlyBudget,
          currentCost,
          yearlyPrediction,
        },
      });

      if (error) throw error;
      
      setAdvice(data.advice);
    } catch (error) {
      console.error('Error getting AI advice:', error);
      toast({
        title: "Error",
        description: "Failed to get AI advice",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Recommendations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={getAIAdvice}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Getting advice...
            </>
          ) : (
            "Get AI Advice"
          )}
        </Button>
        
        {advice && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="whitespace-pre-line">{advice}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};