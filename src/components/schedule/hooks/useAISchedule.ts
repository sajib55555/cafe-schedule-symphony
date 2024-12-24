import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { StaffShifts } from '../types';

export const useAISchedule = (
  selectedWeekStart: Date,
  setShifts: React.Dispatch<React.SetStateAction<{ [weekStart: string]: StaffShifts }>>,
  handleSaveSchedule: () => Promise<void>
) => {
  const [isGeneratingAISchedule, setIsGeneratingAISchedule] = useState(false);

  const handleGenerateAISchedule = async () => {
    setIsGeneratingAISchedule(true);
    try {
      // Get company_id from user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .single();

      if (!profile?.company_id) {
        throw new Error('Company information not found');
      }

      // Call the AI schedule generation function
      const { data, error } = await supabase.functions.invoke('generate-schedule', {
        body: {
          weekStart: format(selectedWeekStart, 'yyyy-MM-dd'),
          companyId: profile.company_id
        }
      });

      if (error) throw error;

      console.log('AI Generated Schedule:', data);
      
      const weekStartStr = format(selectedWeekStart, 'yyyy-MM-dd');
      
      // Update the shifts state with the AI-generated schedule
      setShifts(prevShifts => {
        const newShifts = {
          ...prevShifts,
          [weekStartStr]: data.shifts
        };
        console.log('Updated shifts state:', newShifts);
        return newShifts;
      });

      // Save the generated schedule
      await handleSaveSchedule();
    } catch (error) {
      console.error('Error generating AI schedule:', error);
      throw error;
    } finally {
      setIsGeneratingAISchedule(false);
    }
  };

  return {
    isGeneratingAISchedule,
    handleGenerateAISchedule
  };
};