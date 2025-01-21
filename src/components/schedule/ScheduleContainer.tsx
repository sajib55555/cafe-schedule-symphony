import React, { useRef } from 'react';
import { format, addDays } from 'date-fns';
import { useStaff } from '@/contexts/StaffContext';
import { ScheduleHeader } from './ScheduleHeader';
import { ScheduleGrid } from './ScheduleGrid';
import { useSchedule } from './useSchedule';
import { useShiftActions } from './useShiftActions';
import { ScheduleActions } from './ScheduleActions';
import { useIsMobile } from '@/hooks/use-mobile';
import { useScheduleContext } from './ScheduleContext';

export function ScheduleContainer() {
  const scheduleRef = useRef<HTMLDivElement>(null);
  const { staff, setStaff } = useStaff();
  const { 
    selectedWeekStart, 
    setSelectedWeekStart,
    selectedStaff,
    setSelectedStaff,
    selectedDate,
    setSelectedDate,
    newShift,
    setNewShift,
    isPdfGenerating,
    setIsPdfGenerating
  } = useScheduleContext();

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

  const handleLoadSchedule = (scheduleData: any) => {
    const weekStartStr = format(selectedWeekStart, 'yyyy-MM-dd');
    setShifts(prev => ({
      ...prev,
      [weekStartStr]: scheduleData
    }));
  };

  const isMobile = useIsMobile();

  return (
    <div className="space-y-2 max-w-full overflow-x-auto">
      <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'justify-between'} items-center`}>
        <ScheduleHeader
          selectedWeekStart={selectedWeekStart}
          setSelectedWeekStart={setSelectedWeekStart}
          scheduleRef={scheduleRef}
          onPdfGenerating={setIsPdfGenerating}
          isMobile={isMobile}
        />
        <ScheduleActions
          handleSaveSchedule={handleSaveSchedule}
          isSaving={isSaving}
          onLoadSchedule={handleLoadSchedule}
        />
      </div>
      <div ref={scheduleRef} className="border rounded-lg overflow-hidden">
        <ScheduleGrid
          days={getDaysArray(selectedWeekStart)}
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
          isMobile={isMobile}
        />
      </div>
    </div>
  );
}

function getDaysArray(selectedWeekStart: Date) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(selectedWeekStart, index);
    return {
      name: format(date, 'EEE, MMM d'),
      fullDate: format(date, 'yyyy-MM-dd')
    };
  });
}