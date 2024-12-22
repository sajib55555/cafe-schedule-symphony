import React, { useState, useRef } from 'react';
import { format, startOfWeek, addDays, addWeeks, subWeeks } from "date-fns";
import { useStaff } from '@/contexts/StaffContext';
import { ScheduleHeader } from './schedule/ScheduleHeader';
import { ScheduleGrid } from './schedule/ScheduleGrid';
import { Button } from "@/components/ui/button";
import { Save, Wand2 } from 'lucide-react';
import { useSchedule } from './schedule/useSchedule';
import { useShiftActions } from './schedule/useShiftActions';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";

export function WeeklySchedule() {
  const scheduleRef = useRef<HTMLDivElement>(null);
  const { staff, setStaff } = useStaff();
  const [selectedWeekStart, setSelectedWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [isGeneratingAISchedule, setIsGeneratingAISchedule] = useState(false);
  const { toast } = useToast();
  const { session } = useAuth();
  const [newShift, setNewShift] = useState<{
    startTime: string;
    endTime: string;
    role: 'Barista' | 'Floor';
  }>({
    startTime: '09:00',
    endTime: '17:00',
    role: 'Barista'
  });

  const {
    shifts,
    setShifts,
    isSaving,
    handleSaveSchedule,
    currentWeekShifts
  } = useSchedule(selectedWeekStart, staff, setStaff);

  const {
    handleAddShift,
    handleEditShift,
    handleDeleteShift
  } = useShiftActions(shifts, setShifts, selectedWeekStart, staff, setStaff);

  const navigateWeek = (direction: 'prev' | 'next') => {
    setSelectedWeekStart(current => 
      direction === 'prev' ? subWeeks(current, 1) : addWeeks(current, 1)
    );
  };

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
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-schedule`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            weekStart: format(selectedWeekStart, 'yyyy-MM-dd'),
            companyId: profile.company_id
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate schedule');
      }

      const aiSchedule = await response.json();
      
      // Update the shifts state with the AI-generated schedule
      setShifts(prev => ({
        ...prev,
        [format(selectedWeekStart, 'yyyy-MM-dd')]: aiSchedule.shifts
      }));

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

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(selectedWeekStart, index);
    return {
      name: format(date, 'EEE, MMM d'),
      fullDate: format(date, 'yyyy-MM-dd')
    };
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <ScheduleHeader
          selectedWeekStart={selectedWeekStart}
          navigateWeek={navigateWeek}
          scheduleRef={scheduleRef}
          onPdfGenerating={setIsPdfGenerating}
        />
        <div className="flex gap-2">
          <Button
            onClick={handleGenerateAISchedule}
            disabled={isGeneratingAISchedule}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <Wand2 className="w-4 h-4" />
            {isGeneratingAISchedule ? 'Generating...' : '1 Click AI Magic Rota Maker'}
          </Button>
          <Button 
            onClick={handleSaveSchedule} 
            disabled={isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Schedule'}
          </Button>
        </div>
      </div>
      <div ref={scheduleRef} className="border rounded-lg overflow-hidden">
        <ScheduleGrid
          days={days}
          staff={staff}
          currentWeekShifts={currentWeekShifts}
          selectedStaff={selectedStaff}
          setSelectedStaff={setSelectedStaff}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          newShift={newShift}
          setNewShift={setNewShift}
          handleAddShift={() => handleAddShift(selectedStaff, selectedDate, newShift)}
          handleEditShift={() => handleEditShift(selectedStaff, selectedDate, newShift)}
          handleDeleteShift={handleDeleteShift}
          isPdfGenerating={isPdfGenerating}
        />
      </div>
    </div>
  );
}