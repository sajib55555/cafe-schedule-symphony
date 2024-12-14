import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays } from "date-fns";
import { SchedulePdfExport } from '../SchedulePdfExport';

interface ScheduleHeaderProps {
  selectedWeekStart: Date;
  navigateWeek: (direction: 'prev' | 'next') => void;
  scheduleRef: React.RefObject<HTMLDivElement>;
  onPdfGenerating: (generating: boolean) => void;
}

export function ScheduleHeader({ selectedWeekStart, navigateWeek, scheduleRef, onPdfGenerating }: ScheduleHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-secondary">
        Schedule for {format(selectedWeekStart, 'MMM d, yyyy')} through {format(addDays(selectedWeekStart, 6), 'MMM d, yyyy')}
      </h2>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => navigateWeek('prev')}>
          <ChevronLeft className="h-4 w-4" />
          Previous Week
        </Button>
        <Button variant="outline" onClick={() => navigateWeek('next')}>
          Next Week
          <ChevronRight className="h-4 w-4" />
        </Button>
        <SchedulePdfExport scheduleRef={scheduleRef} onPdfGenerating={onPdfGenerating} />
      </div>
    </div>
  );
}