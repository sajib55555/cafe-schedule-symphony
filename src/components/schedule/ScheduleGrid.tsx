import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ShiftDialog } from './ShiftDialog';

interface ScheduleGridProps {
  days: Array<{ name: string; fullDate: string }>;
  staff: Array<{ id: string; name: string; hours: number }>;
  currentWeekShifts: any;
  selectedStaff: string;
  setSelectedStaff: (staff: string) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  newShift: {
    startTime: string;
    endTime: string;
    role: 'Barista' | 'Floor';
  };
  setNewShift: React.Dispatch<React.SetStateAction<{
    startTime: string;
    endTime: string;
    role: 'Barista' | 'Floor';
  }>>;
  handleAddShift: () => void;
}

export function ScheduleGrid({
  days,
  staff,
  currentWeekShifts,
  selectedStaff,
  setSelectedStaff,
  selectedDate,
  setSelectedDate,
  newShift,
  setNewShift,
  handleAddShift
}: ScheduleGridProps) {
  return (
    <div className="grid grid-cols-[200px,repeat(7,1fr)]">
      <div className="bg-secondary text-white p-4 font-semibold">Staff</div>
      {days.map((day) => (
        <div key={day.fullDate} className="bg-secondary text-white p-4 font-semibold text-center border-l border-white/20">
          {day.name}
        </div>
      ))}

      {staff.map((person) => (
        <React.Fragment key={person.id}>
          <div className="border-t p-4 bg-gray-50">
            <div className="font-medium">{person.name}</div>
            <div className="text-sm text-gray-500">{person.hours} hrs</div>
          </div>
          {days.map((day) => {
            const shift = currentWeekShifts[person.name]?.[day.fullDate];
            return (
              <div key={`${person.name}-${day.fullDate}`} className="border-t border-l p-2 min-h-[100px]">
                {shift ? (
                  <div className="bg-primary text-white p-2 rounded-md text-sm">
                    <div>{shift.startTime} - {shift.endTime}</div>
                    <div>{shift.role}</div>
                  </div>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="w-full h-full"
                        onClick={() => {
                          setSelectedStaff(person.name);
                          setSelectedDate(day.fullDate);
                        }}
                      >
                        + Add Shift
                      </Button>
                    </DialogTrigger>
                    <ShiftDialog
                      selectedStaff={selectedStaff}
                      selectedDate={selectedDate}
                      newShift={newShift}
                      setNewShift={setNewShift}
                      handleAddShift={handleAddShift}
                    />
                  </Dialog>
                )}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}