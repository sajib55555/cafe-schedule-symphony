import { format, startOfMonth, endOfMonth, parseISO, differenceInHours } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { Staff } from '@/contexts/StaffContext';
import { calculateHours, calculateTotalHours } from './utils/timeCalculations';
import { updateStaffHours } from './services/staffService';
import { supabase } from "@/integrations/supabase/client";

export const useShiftActions = (
  shifts: any,
  setShifts: any,
  selectedWeekStart: Date,
  staff: Staff[],
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>
) => {
  const { toast } = useToast();

  const updateMonthlyWages = async (
    staffId: number, 
    companyId: string, 
    monthStart: Date,
    monthEnd: Date
  ) => {
    try {
      // Calculate total hours and wages for the month
      const { data: monthShifts, error: shiftsError } = await supabase
        .from('shifts')
        .select('*')
        .eq('staff_id', staffId)
        .gte('start_time', format(monthStart, "yyyy-MM-dd'T'HH:mm:ssXXX"))
        .lte('end_time', format(monthEnd, "yyyy-MM-dd'T'HH:mm:ssXXX"));

      if (shiftsError) throw shiftsError;

      const totalHours = monthShifts?.reduce((acc, shift) => {
        return acc + differenceInHours(parseISO(shift.end_time), parseISO(shift.start_time));
      }, 0) || 0;

      const staffMember = staff.find(s => s.id === staffId);
      const totalWages = totalHours * (staffMember?.hourly_pay || 0);

      // Update or insert monthly wages record
      const { data: existing } = await supabase
        .from('monthly_wages')
        .select('id')
        .eq('staff_id', staffId)
        .eq('month_start', format(monthStart, 'yyyy-MM-dd'))
        .eq('month_end', format(monthEnd, 'yyyy-MM-dd'))
        .single();

      if (existing) {
        await supabase
          .from('monthly_wages')
          .update({
            total_hours: totalHours,
            total_wages: totalWages,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('monthly_wages')
          .insert({
            staff_id: staffId,
            company_id: companyId,
            month_start: format(monthStart, 'yyyy-MM-dd'),
            month_end: format(monthEnd, 'yyyy-MM-dd'),
            total_hours: totalHours,
            total_wages: totalWages
          });
      }
    } catch (error) {
      console.error('Error updating monthly wages:', error);
    }
  };

  const handleAddShift = async (selectedStaff: string, selectedDate: string, newShift: any) => {
    if (!selectedStaff || !selectedDate) return;

    const weekStartStr = format(selectedWeekStart, 'yyyy-MM-dd');
    const hours = calculateHours(newShift.startTime, newShift.endTime);
    
    try {
      setShifts(prev => ({
        ...prev,
        [weekStartStr]: {
          ...(prev[weekStartStr] || {}),
          [selectedStaff]: {
            ...(prev[weekStartStr]?.[selectedStaff] || {}),
            [selectedDate]: newShift
          }
        }
      }));

      const staffMember = staff.find(person => person.name === selectedStaff);
      if (staffMember) {
        const newTotalHours = calculateTotalHours(selectedStaff, weekStartStr, {
          ...shifts[weekStartStr],
          [selectedStaff]: {
            ...(shifts[weekStartStr]?.[selectedStaff] || {}),
            [selectedDate]: newShift
          }
        });

        await updateStaffHours(staffMember.id, newTotalHours);

        // Update monthly wages
        const shiftDate = new Date(selectedDate);
        await updateMonthlyWages(
          staffMember.id,
          staffMember.company_id!,
          startOfMonth(shiftDate),
          endOfMonth(shiftDate)
        );

        setStaff(prev => prev.map(person => {
          if (person.id === staffMember.id) {
            return { ...person, hours: newTotalHours };
          }
          return person;
        }));
      }

      toast({
        title: "Shift Added",
        description: `Added shift for ${selectedStaff} on ${format(new Date(selectedDate), 'EEE, MMM d')}`,
      });
    } catch (error) {
      console.error('Error adding shift:', error);
      toast({
        title: "Error",
        description: "Failed to add shift. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditShift = async (selectedStaff: string, selectedDate: string, newShift: any) => {
    if (!selectedStaff || !selectedDate) return;

    const weekStartStr = format(selectedWeekStart, 'yyyy-MM-dd');
    
    try {
      setShifts(prev => ({
        ...prev,
        [weekStartStr]: {
          ...(prev[weekStartStr] || {}),
          [selectedStaff]: {
            ...(prev[weekStartStr]?.[selectedStaff] || {}),
            [selectedDate]: newShift
          }
        }
      }));

      const staffMember = staff.find(person => person.name === selectedStaff);
      if (staffMember) {
        const newTotalHours = calculateTotalHours(selectedStaff, weekStartStr, {
          ...shifts[weekStartStr],
          [selectedStaff]: {
            ...(shifts[weekStartStr]?.[selectedStaff] || {}),
            [selectedDate]: newShift
          }
        });

        await updateStaffHours(staffMember.id, newTotalHours);

        // Update monthly wages
        const shiftDate = new Date(selectedDate);
        await updateMonthlyWages(
          staffMember.id,
          staffMember.company_id!,
          startOfMonth(shiftDate),
          endOfMonth(shiftDate)
        );

        setStaff(prev => prev.map(person => {
          if (person.id === staffMember.id) {
            return { ...person, hours: newTotalHours };
          }
          return person;
        }));
      }

      toast({
        title: "Shift Updated",
        description: `Updated shift for ${selectedStaff} on ${format(new Date(selectedDate), 'EEE, MMM d')}`,
      });
    } catch (error) {
      console.error('Error updating shift:', error);
      toast({
        title: "Error",
        description: "Failed to update shift. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteShift = async (staffName: string, date: string) => {
    const weekStartStr = format(selectedWeekStart, 'yyyy-MM-dd');
    
    try {
      const updatedShifts = { ...shifts };
      if (updatedShifts[weekStartStr]?.[staffName]) {
        const staffShifts = { ...updatedShifts[weekStartStr][staffName] };
        delete staffShifts[date];
        
        if (Object.keys(staffShifts).length === 0) {
          delete updatedShifts[weekStartStr][staffName];
        } else {
          updatedShifts[weekStartStr][staffName] = staffShifts;
        }
      }

      setShifts(updatedShifts);

      const staffMember = staff.find(person => person.name === staffName);
      if (staffMember) {
        const newTotalHours = calculateTotalHours(staffName, weekStartStr, updatedShifts[weekStartStr] || {});

        await updateStaffHours(staffMember.id, newTotalHours);

        // Update monthly wages
        const shiftDate = new Date(date);
        await updateMonthlyWages(
          staffMember.id,
          staffMember.company_id!,
          startOfMonth(shiftDate),
          endOfMonth(shiftDate)
        );

        setStaff(prev => prev.map(person => {
          if (person.id === staffMember.id) {
            return { ...person, hours: newTotalHours };
          }
          return person;
        }));
      }

      toast({
        title: "Shift Deleted",
        description: `Deleted shift for ${staffName} on ${format(new Date(date), 'EEE, MMM d')}`,
      });
    } catch (error) {
      console.error('Error deleting shift:', error);
      toast({
        title: "Error",
        description: "Failed to delete shift. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    handleAddShift,
    handleEditShift,
    handleDeleteShift
  };
};