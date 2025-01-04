import { useToast } from "@/components/ui/use-toast";
import { Staff } from '@/contexts/StaffContext';
import { format } from "date-fns";
import { addShift, editShift, deleteShift } from './services/shiftService';

export const useShiftActions = (
  shifts: any,
  setShifts: any,
  selectedWeekStart: Date,
  staff: Staff[],
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>
) => {
  const { toast } = useToast();
  const weekStartStr = format(selectedWeekStart, 'yyyy-MM-dd');

  const handleAddShift = async (selectedStaff: string, selectedDate: string, newShift: any) => {
    try {
      const staffMember = await addShift(
        selectedStaff,
        selectedDate,
        newShift,
        weekStartStr,
        shifts,
        staff,
        setShifts,
        setStaff
      );

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
    try {
      const staffMember = await editShift(
        selectedStaff,
        selectedDate,
        newShift,
        weekStartStr,
        shifts,
        staff,
        setShifts,
        setStaff
      );

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
    try {
      const staffMember = await deleteShift(
        staffName,
        date,
        weekStartStr,
        shifts,
        staff,
        setShifts,
        setStaff
      );

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