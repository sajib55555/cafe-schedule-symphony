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
  isMobile?: boolean;
}

export function ScheduleHeader({ 
  selectedWeekStart, 
  navigateWeek, 
  scheduleRef, 
  onPdfGenerating,
  isMobile 
}: ScheduleHeaderProps) {
  return (
    <div className={`flex ${isMobile ? 'flex-col space-y-2 w-full' : 'justify-between'} items-center`}>
      <h2 className={`text-xl font-bold text-secondary ${isMobile ? 'text-center' : ''}`}>
        {format(selectedWeekStart, 'MMM d')} - {format(addDays(selectedWeekStart, 6), 'MMM d, yyyy')}
      </h2>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size={isMobile ? "sm" : "default"}
          onClick={() => navigateWeek('prev')}
        >
          <ChevronLeft className="h-4 w-4" />
          {!isMobile && "Previous"}
        </Button>
        <Button 
          variant="outline"
          size={isMobile ? "sm" : "default"}
          onClick={() => navigateWeek('next')}
        >
          {!isMobile && "Next"}
          <ChevronRight className="h-4 w-4" />
        </Button>
        <SchedulePdfExport 
          scheduleRef={scheduleRef} 
          onPdfGenerating={onPdfGenerating} 
        />
      </div>
    </div>
  );
}