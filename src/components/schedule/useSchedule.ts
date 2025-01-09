import { useState, useEffect } from 'react';
import { format, addDays } from "date-fns";
import { supabase } from '@/integrations/supabase/client';
import { Staff } from '@/contexts/StaffContext';
import { useToast } from "@/components/ui/use-toast";
import { StaffShifts } from './types/shift.types';
import {
  ensureStaffExists,
  getUpdatedStaff,
  deleteExistingShifts,
  insertShifts,
  prepareShiftsForInsert
} from './services/shift.service';

export const useSchedule = (selectedWeekStart: Date, staff: Staff[], setStaff: React.Dispatch<React.SetStateAction<Staff[]>>) => {
  const { toast } = useToast();
  const [shifts, setShifts] = useState<{ [weekStart: string]: StaffShifts }>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadShifts = async () => {
      const weekStartStr = format(selectedWeekStart, 'yyyy-MM-dd');
      const endOfWeekDate = addDays(selectedWeekStart, 7);
      
      try {
        const { data: existingShifts, error } = await supabase
          .from('shifts')
          .select('*, staff(id, name, role)')
          .gte('start_time', `${weekStartStr}T00:00:00`)
          .lt('start_time', format(endOfWeekDate, 'yyyy-MM-dd'));

        if (error) throw error;

        if (existingShifts) {
          const formattedShifts: { [weekStart: string]: StaffShifts } = {};
          formattedShifts[weekStartStr] = {};
          const staffHours: { [key: string]: number } = {};

          existingShifts.forEach((shift) => {
            if (!shift.staff?.name) return;
            
            const shiftDate = format(new Date(shift.start_time), 'yyyy-MM-dd');
            const startTime = format(new Date(shift.start_time), 'HH:mm');
            const endTime = format(new Date(shift.end_time), 'HH:mm');

            // Calculate hours for this shift
            const start = new Date(`${shiftDate}T${startTime}`);
            const end = new Date(`${shiftDate}T${endTime}`);
            const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

            // Add hours to staff member's total
            staffHours[shift.staff.name] = (staffHours[shift.staff.name] || 0) + hours;

            if (!formattedShifts[weekStartStr][shift.staff.name]) {
              formattedShifts[weekStartStr][shift.staff.name] = {};
            }

            formattedShifts[weekStartStr][shift.staff.name][shiftDate] = {
              startTime,
              endTime,
              role: shift.role as 'Barista' | 'Floor'
            };
          });

          // Update staff hours
          setStaff(prev => prev.map(member => ({
            ...member,
            hours: staffHours[member.name] || 0
          })));

          setShifts(formattedShifts);
        }
      } catch (error) {
        console.error('Error loading shifts:', error);
        toast({
          title: "Error",
          description: "Failed to load shifts. Please try again.",
          variant: "destructive"
        });
      }
    };

    loadShifts();
  }, [selectedWeekStart, toast, setStaff]);

  const handleSaveSchedule = async () => {
    setIsSaving(true);
    const weekStartStr = format(selectedWeekStart, 'yyyy-MM-dd');
    const currentWeekShifts = shifts[weekStartStr] || {};
    
    try {
      await ensureStaffExists(Object.keys(currentWeekShifts)[0]);
      const updatedStaff = await getUpdatedStaff();
      
      const startOfWeekDate = new Date(weekStartStr);
      const endOfWeekDate = addDays(startOfWeekDate, 7);
      
      await deleteExistingShifts(startOfWeekDate, endOfWeekDate);
      
      const shiftsToInsert = prepareShiftsForInsert(currentWeekShifts, updatedStaff, weekStartStr);
      await insertShifts(shiftsToInsert);

      toast({
        title: "Success",
        description: "Schedule saved successfully",
      });
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast({
        title: "Error",
        description: "Failed to save schedule. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    shifts,
    setShifts,
    isSaving,
    handleSaveSchedule,
    currentWeekShifts: shifts[format(selectedWeekStart, 'yyyy-MM-dd')] || {}
  };
};
