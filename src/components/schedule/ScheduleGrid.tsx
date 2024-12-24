import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ShiftDialog } from './ShiftDialog';
import { Staff } from '@/contexts/StaffContext';
import { Edit2, Trash2 } from 'lucide-react';

interface ScheduleGridProps {
  days: Array<{ name: string; fullDate: string }>;
  staff: Staff[];
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
  handleEditShift: () => void;
  handleDeleteShift: (staffName: string, date: string) => void;
  isPdfGenerating?: boolean;
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
  handleAddShift,
  handleEditShift,
  handleDeleteShift,
  isPdfGenerating = false
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
              <div key={`${person.name}-${day.fullDate}`} className="border-t border-l p-2 min-h-[100px] relative">
                {shift ? (
                  <div className="bg-primary/90 text-white p-2 rounded-md text-sm space-y-2 hover:bg-primary transition-colors">
                    <div className="font-medium">{shift.startTime} - {shift.endTime}</div>
                    <div className="text-white/90">{shift.role}</div>
                    {!isPdfGenerating && (
                      <div className="flex gap-2 mt-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="secondary" 
                              size="sm"
                              className="flex-1"
                              onClick={() => {
                                setSelectedStaff(person.name);
                                setSelectedDate(day.fullDate);
                                setNewShift(shift);
                              }}
                            >
                              <Edit2 className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </DialogTrigger>
                          <ShiftDialog
                            selectedStaff={selectedStaff}
                            selectedDate={selectedDate}
                            newShift={newShift}
                            setNewShift={setNewShift}
                            handleAddShift={handleEditShift}
                            mode="edit"
                          />
                        </Dialog>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          className="flex-1"
                          onClick={() => handleDeleteShift(person.name, day.fullDate)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  !isPdfGenerating && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="absolute inset-0 w-full h-full hover:bg-gray-50 transition-colors"
                          onClick={() => {
                            setSelectedStaff(person.name);
                            setSelectedDate(day.fullDate);
                            setNewShift({
                              startTime: '09:00',
                              endTime: '17:00',
                              role: 'Barista'
                            });
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
                        mode="add"
                      />
                    </Dialog>
                  )
                )}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}