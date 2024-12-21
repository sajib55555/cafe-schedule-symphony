import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

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
      const response = await fetch('/api/generate-wage-advice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          monthlyBudget,
          currentCost,
          yearlyPrediction,
        }),
      });

      if (!response.ok) throw new Error('Failed to get AI advice');
      
      const data = await response.json();
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