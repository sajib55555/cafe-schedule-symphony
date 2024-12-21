import React, { useState, useRef, useEffect } from 'react';
import { format, startOfWeek, addDays, addWeeks, subWeeks } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { useStaff } from '@/contexts/StaffContext';
import { ScheduleHeader } from './schedule/ScheduleHeader';
import { ScheduleGrid } from './schedule/ScheduleGrid';
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { Save } from 'lucide-react';

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
  const [isSaving, setIsSaving] = useState(false);
  const [newShift, setNewShift] = useState<Shift>({
    startTime: '09:00',
    endTime: '17:00',
    role: 'Barista'
  });

  // Load existing shifts when component mounts or week changes
  useEffect(() => {
    const loadShifts = async () => {
      const weekStartStr = format(selectedWeekStart, 'yyyy-MM-dd');
      const endOfWeekDate = addDays(selectedWeekStart, 7);
      
      const { data: existingShifts, error } = await supabase
        .from('shifts')
        .select('*, staff(name, role)')
        .gte('start_time', `${weekStartStr}T00:00:00`)
        .lt('start_time', format(endOfWeekDate, 'yyyy-MM-dd'));

      if (error) {
        console.error('Error loading shifts:', error);
        return;
      }

      if (existingShifts) {
        const formattedShifts: { [weekStart: string]: StaffShifts } = {};
        formattedShifts[weekStartStr] = {};

        existingShifts.forEach((shift) => {
          if (!shift.staff?.name) return;
          
          const shiftDate = format(new Date(shift.start_time), 'yyyy-MM-dd');
          const startTime = format(new Date(shift.start_time), 'HH:mm');
          const endTime = format(new Date(shift.end_time), 'HH:mm');

          if (!formattedShifts[weekStartStr][shift.staff.name]) {
            formattedShifts[weekStartStr][shift.staff.name] = {};
          }

          formattedShifts[weekStartStr][shift.staff.name][shiftDate] = {
            startTime,
            endTime,
            role: shift.role as 'Barista' | 'Floor'
          };
        });

        setShifts(formattedShifts);
      }
    };

    loadShifts();
  }, [selectedWeekStart]);

  const handleSaveSchedule = async () => {
    setIsSaving(true);
    const weekStartStr = format(selectedWeekStart, 'yyyy-MM-dd');
    const currentWeekShifts = shifts[weekStartStr] || {};
    
    try {
      // First, delete all existing shifts for this week
      const startOfWeekDate = new Date(weekStartStr);
      const endOfWeekDate = addDays(startOfWeekDate, 7);
      
      const { error: deleteError } = await supabase
        .from('shifts')
        .delete()
        .gte('start_time', startOfWeekDate.toISOString())
        .lt('start_time', endOfWeekDate.toISOString());

      if (deleteError) throw deleteError;

      // Then insert all current shifts
      const shiftsToInsert = [];
      
      for (const [staffName, staffShifts] of Object.entries(currentWeekShifts)) {
        const staffMember = staff.find(s => s.name === staffName);
        if (!staffMember?.id) {
          console.error(`Staff member ${staffName} not found or has no ID`);
          continue;
        }

        for (const [date, shift] of Object.entries(staffShifts)) {
          shiftsToInsert.push({
            staff_id: staffMember.id,
            start_time: `${date}T${shift.startTime}:00`,
            end_time: `${date}T${shift.endTime}:00`,
            role: shift.role
          });
        }
      }

      if (shiftsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('shifts')
          .insert(shiftsToInsert);

        if (insertError) {
          console.error('Insert error:', insertError);
          throw insertError;
        }
      }

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
        <Button 
          onClick={handleSaveSchedule} 
          disabled={isSaving}
          className="ml-4"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Schedule'}
        </Button>
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
          handleAddShift={handleAddShift}
          handleEditShift={handleEditShift}
          handleDeleteShift={handleDeleteShift}
          isPdfGenerating={isPdfGenerating}
        />
      </div>
    </div>
  );
}
