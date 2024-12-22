import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { Staff } from '@/contexts/StaffContext';
import { calculateHours, calculateTotalHours } from './utils/timeCalculations';
import { updateStaffHours } from './services/staffService';

export const useShiftActions = (
  shifts: any,
  setShifts: any,
  selectedWeekStart: Date,
  staff: Staff[],
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>
) => {
  const { toast } = useToast();

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
    const shift = shifts[weekStartStr]?.[staffName]?.[date];
    
    if (shift) {
      try {
        // First update the shifts state
        setShifts(prev => {
          const newShifts = { ...prev };
          const staffShifts = { ...newShifts[weekStartStr]?.[staffName] };
          delete staffShifts[date];
          
          if (Object.keys(staffShifts).length === 0) {
            delete newShifts[weekStartStr][staffName];
          } else {
            newShifts[weekStartStr] = {
              ...newShifts[weekStartStr],
              [staffName]: staffShifts
            };
          }
          
          return newShifts;
        });

        // Find the staff member and update their hours
        const staffMember = staff.find(person => person.name === staffName);
        if (staffMember) {
          // Calculate new total hours after deletion
          const newTotalHours = calculateTotalHours(staffName, weekStartStr, {
            ...shifts[weekStartStr],
            [staffName]: {
              ...shifts[weekStartStr]?.[staffName],
              [date]: undefined
            }
          });

          // Update staff hours in the database
          await updateStaffHours(staffMember.id, newTotalHours);

          // Update staff state with new hours
          setStaff(prev => prev.map(person => {
            if (person.id === staffMember.id) {
              return {
                ...person,
                hours: newTotalHours
              };
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
    }
  };

  return {
    handleAddShift,
    handleEditShift,
    handleDeleteShift
  };
};