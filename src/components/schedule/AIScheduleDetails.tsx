import React from 'react';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { AISchedule } from './types/aiSchedule.types';

interface AIScheduleDetailsProps {
  schedule: AISchedule;
  onClose: () => void;
}

export const AIScheduleDetails = ({ schedule, onClose }: AIScheduleDetailsProps) => {
  return (
    <div className="mt-4 border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Schedule Details</h3>
      <div className="grid grid-cols-[200px,repeat(7,1fr)] gap-2">
        <div className="font-medium">Staff</div>
        {Array.from({ length: 7 }, (_, i) => {
          const date = new Date(schedule.week_start);
          date.setDate(date.getDate() + i);
          return (
            <div key={i} className="font-medium text-center">
              {format(date, 'EEE, MMM d')}
            </div>
          );
        })}
        
        {Object.entries(schedule.schedule_data).map(([staffName, staffShifts]) => (
          <React.Fragment key={staffName}>
            <div className="py-2">{staffName}</div>
            {Array.from({ length: 7 }, (_, i) => {
              const date = new Date(schedule.week_start);
              date.setDate(date.getDate() + i);
              const dateStr = format(date, 'yyyy-MM-dd');
              const shift = staffShifts[dateStr];
              
              return (
                <div key={dateStr} className="border p-2 min-h-[60px]">
                  {shift && (
                    <div className="text-sm">
                      <div>{shift.startTime} - {shift.endTime}</div>
                      <div>{shift.role}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      <Button 
        className="mt-4"
        variant="outline"
        onClick={onClose}
      >
        Close
      </Button>
    </div>
  );
};