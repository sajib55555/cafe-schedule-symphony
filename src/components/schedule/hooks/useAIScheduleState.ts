import { useState } from 'react';
import { format } from 'date-fns';
import { useToast } from "@/components/ui/use-toast";
import { StaffShifts } from '../types';
import { getCompanyProfile, generateAISchedule } from '../services/aiScheduleService';

export function useAIScheduleState(
  selectedWeekStart: Date,
  setShifts: React.Dispatch<React.SetStateAction<{ [weekStart: string]: StaffShifts }>>,
  handleSaveSchedule: () => Promise<void>
) {
  const [isGeneratingAISchedule, setIsGeneratingAISchedule] = useState(false);
  const { toast } = useToast();

  const handleGenerateAISchedule = async () => {
    setIsGeneratingAISchedule(true);
    try {
      const profile = await getCompanyProfile();
      const weekStartStr = format(selectedWeekStart, 'yyyy-MM-dd');
      const data = await generateAISchedule(weekStartStr, profile.company_id);

      console.log('AI Generated Schedule:', data);
      
      setShifts(prevShifts => {
        const newShifts = {
          ...prevShifts,
          [weekStartStr]: data.shifts
        };
        console.log('Updated shifts state:', newShifts);
        return newShifts;
      });

      await handleSaveSchedule();

      toast({
        title: "Success",
        description: "AI schedule generated successfully!",
      });
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
}