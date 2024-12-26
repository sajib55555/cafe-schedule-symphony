import React, { useState, useRef } from 'react';
import { format, startOfWeek, addDays, addWeeks, subWeeks } from "date-fns";
import { useStaff } from '@/contexts/StaffContext';
import { ScheduleHeader } from './schedule/ScheduleHeader';
import { ScheduleGrid } from './schedule/ScheduleGrid';
import { useSchedule } from './schedule/useSchedule';
import { useShiftActions } from './schedule/useShiftActions';
import { ScheduleActions } from './schedule/ScheduleActions';

export function WeeklySchedule() {
  const scheduleRef = useRef<HTMLDivElement>(null);
  const { staff, setStaff } = useStaff();
  const [selectedWeekStart, setSelectedWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
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
        <ScheduleActions
          handleSaveSchedule={handleSaveSchedule}
          isSaving={isSaving}
        />
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