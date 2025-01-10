import React from 'react';
import { Button } from "@/components/ui/button";
import { Save, Wand2 } from "lucide-react";
import { AIScheduleHistory } from './AIScheduleHistory';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ScheduleActionsProps {
  handleSaveSchedule: () => Promise<void>;
  isSaving: boolean;
}

export function ScheduleActions({
  handleSaveSchedule,
  isSaving
}: ScheduleActionsProps) {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const { toast } = useToast();
  const { session } = useAuth();

  const handleGenerateAISchedule = async () => {
    try {
      setIsGenerating(true);

      // Get company_id from user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', session?.user?.id)
        .single();

      if (!profile?.company_id) {
        toast({
          title: "Error",
          description: "Company information not found",
          variant: "destructive",
        });
        return;
      }

      // Call the AI schedule generation function
      const { data, error } = await supabase.functions.invoke('generate-schedule', {
        body: {
          weekStart: new Date().toISOString(),
          companyId: profile.company_id
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "AI schedule generated successfully!",
      });

    } catch (error) {
      console.error('Error generating AI schedule:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI schedule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button 
        onClick={handleSaveSchedule} 
        disabled={isSaving}
        className="flex items-center gap-2"
      >
        <Save className="w-4 h-4" />
        {isSaving ? 'Saving...' : 'Save Schedule'}
      </Button>

      <Button
        onClick={handleGenerateAISchedule}
        disabled={isGenerating}
        variant="secondary"
        className="flex items-center gap-2"
      >
        <Wand2 className="w-4 h-4" />
        {isGenerating ? 'Generating...' : 'AI Schedule'}
      </Button>

      <AIScheduleHistory onLoadSchedule={() => {}} />
    </div>
  );
}