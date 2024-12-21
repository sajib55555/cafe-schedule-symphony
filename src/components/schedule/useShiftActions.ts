import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { Staff } from '@/contexts/StaffContext';

const calculateHours = (startTime: string, endTime: string) => {
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
};

export const useShiftActions = (
  shifts: any,
  setShifts: any,
  selectedWeekStart: Date,
  staff: Staff[],
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>
) => {
  const { toast } = useToast();

  const handleAddShift = (selectedStaff: string, selectedDate: string, newShift: any) => {
    if (!selectedStaff || !selectedDate) return;

    const weekStartStr = format(selectedWeekStart, 'yyyy-MM-dd');
    const hours = calculateHours(newShift.startTime, newShift.endTime);
    
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

    setStaff(prev => prev.map(person => {
      if (person.name === selectedStaff) {
        return {
          ...person,
          hours: Number(person.hours || 0) + hours
        };
      }
      return person;
    }));

    toast({
      title: "Shift Added",
      description: `Added shift for ${selectedStaff} on ${format(new Date(selectedDate), 'EEE, MMM d')}`,
    });
  };

  const handleEditShift = (selectedStaff: string, selectedDate: string, newShift: any) => {
    if (!selectedStaff || !selectedDate) return;

    const weekStartStr = format(selectedWeekStart, 'yyyy-MM-dd');
    const oldShift = shifts[weekStartStr]?.[selectedStaff]?.[selectedDate];
    const oldHours = oldShift ? calculateHours(oldShift.startTime, oldShift.endTime) : 0;
    const newHours = calculateHours(newShift.startTime, newShift.endTime);
    
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

    setStaff(prev => prev.map(person => {
      if (person.name === selectedStaff) {
        return {
          ...person,
          hours: Number(person.hours || 0) - oldHours + newHours
        };
      }
      return person;
    }));

    toast({
      title: "Shift Updated",
      description: `Updated shift for ${selectedStaff} on ${format(new Date(selectedDate), 'EEE, MMM d')}`,
    });
  };

  const handleDeleteShift = (staffName: string, date: string) => {
    const weekStartStr = format(selectedWeekStart, 'yyyy-MM-dd');
    const shift = shifts[weekStartStr]?.[staffName]?.[date];
    
    if (shift) {
      const hours = calculateHours(shift.startTime, shift.endTime);
      
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

      setStaff(prev => prev.map(person => {
        if (person.name === staffName) {
          return {
            ...person,
            hours: Math.max(0, Number(person.hours || 0) - hours)
          };
        }
        return person;
      }));

      toast({
        title: "Shift Deleted",
        description: `Deleted shift for ${staffName} on ${format(new Date(date), 'EEE, MMM d')}`,
      });
    }
  };

  return {
    handleAddShift,
    handleEditShift,
    handleDeleteShift
  };
};