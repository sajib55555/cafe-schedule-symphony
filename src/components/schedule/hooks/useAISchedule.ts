import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { format } from "date-fns";
import { useAuth } from '@/contexts/AuthContext';

export const useAISchedule = (
  selectedWeekStart: Date,
  setShifts: React.Dispatch<React.SetStateAction<any>>,
  handleSaveSchedule: () => Promise<void>
) => {
  const [isGeneratingAISchedule, setIsGeneratingAISchedule] = useState(false);
  const { toast } = useToast();
  const { session } = useAuth();

  const handleGenerateAISchedule = async () => {
    try {
      setIsGeneratingAISchedule(true);

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
          variant: "destructive"
        });
        return;
      }

      // Call the AI schedule generation function
      const response = await supabase.functions.invoke('generate-schedule', {
        body: {
          weekStart: format(selectedWeekStart, 'yyyy-MM-dd'),
          companyId: profile.company_id
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const aiSchedule = response.data;
      console.log('AI Generated Schedule:', aiSchedule);
      
      if (!aiSchedule || !aiSchedule.shifts) {
        throw new Error('Invalid AI schedule format');
      }

      // Format the shifts data to match the expected structure
      const formattedShifts = {};
      const weekStartStr = format(selectedWeekStart, 'yyyy-MM-dd');
      formattedShifts[weekStartStr] = aiSchedule.shifts;

      // Update the shifts state with the formatted AI-generated schedule
      setShifts(formattedShifts);

      toast({
        title: "Success",
        description: "AI schedule generated successfully!",
      });

      // Save the generated schedule
      await handleSaveSchedule();
    } catch (error) {
      console.error('Error generating AI schedule:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI schedule. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingAISchedule(false);
    }
  };

  return {
    isGeneratingAISchedule,
    handleGenerateAISchedule
  };
};