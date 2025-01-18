import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AIHRAdvisor() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('hr-advisor', {
        body: { question },
      });

      if (error) throw error;
      
      setAnswer(data.answer);
    } catch (error) {
      console.error('Error getting HR advice:', error);
      toast({
        title: "Error",
        description: "Failed to get HR advice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI HR Advisor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="Ask any HR-related question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[100px]"
            />
            <Button 
              type="submit" 
              disabled={isLoading || !question.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Getting advice...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Get HR Advice
                </>
              )}
            </Button>
          </form>

          {answer && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">AI HR Advisor Response:</h3>
              <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap">
                {answer}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}