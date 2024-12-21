import React, { useState, useRef } from 'react';
import { format, startOfWeek, addDays, addWeeks, subWeeks } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { useStaff } from '@/contexts/StaffContext';
import { ScheduleHeader } from './schedule/ScheduleHeader';
import { ScheduleGrid } from './schedule/ScheduleGrid';

interface Shift {
  startTime: string;
  endTime: string;
  role: 'Barista' | 'Floor';
}

interface StaffShifts {
  [key: string]: {
    [key: string]: Shift;
  };
}

const calculateHours = (startTime: string, endTime: string) => {
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
};

export function WeeklySchedule() {
  const scheduleRef = useRef<HTMLDivElement>(null);
  const { staff, setStaff } = useStaff();
  const { toast } = useToast();
  const [selectedWeekStart, setSelectedWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [shifts, setShifts] = useState<{ [weekStart: string]: StaffShifts }>({});
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [newShift, setNewShift] = useState<Shift>({
    startTime: '09:00',
    endTime: '17:00',
    role: 'Barista'
  });

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(selectedWeekStart, index);
    return {
      name: format(date, 'EEE, MMM d'),
      fullDate: format(date, 'yyyy-MM-dd')
    };
  });

  const handleAddShift = () => {
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

  const handleEditShift = () => {
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

  const navigateWeek = (direction: 'prev' | 'next') => {
    setSelectedWeekStart(current => 
      direction === 'prev' ? subWeeks(current, 1) : addWeeks(current, 1)
    );
  };

  const currentWeekShifts = shifts[format(selectedWeekStart, 'yyyy-MM-dd')] || {};

  return (
    <div className="space-y-4">
      <ScheduleHeader
        selectedWeekStart={selectedWeekStart}
        navigateWeek={navigateWeek}
        scheduleRef={scheduleRef}
        onPdfGenerating={setIsPdfGenerating}
      />
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
          handleAddShift={handleAddShift}
          handleEditShift={handleEditShift}
          handleDeleteShift={handleDeleteShift}
          isPdfGenerating={isPdfGenerating}
        />
      </div>
    </div>
  );
}