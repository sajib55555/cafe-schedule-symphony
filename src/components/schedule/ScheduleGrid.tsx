import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ShiftDialog } from './ShiftDialog';
import { Staff } from '@/contexts/StaffContext';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { calculateTotalHours } from './utils/timeCalculations';

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
  isMobile?: boolean;
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
  isPdfGenerating = false,
  isMobile = false
}: ScheduleGridProps) {
  const calculateWeeklyHours = (staffName: string) => {
    let totalHours = 0;
    const staffShifts = currentWeekShifts[staffName] || {};
    
    Object.values(staffShifts).forEach((shift: any) => {
      const startHour = parseInt(shift.startTime.split(':')[0]);
      const startMinute = parseInt(shift.startTime.split(':')[1]);
      const endHour = parseInt(shift.endTime.split(':')[0]);
      const endMinute = parseInt(shift.endTime.split(':')[1]);
      
      const hours = endHour - startHour + (endMinute - startMinute) / 60;
      totalHours += hours;
    });
    
    return totalHours.toFixed(1);
  };

  if (isMobile) {
    return (
      <div className="space-y-4">
        {days.map((day) => (
          <div key={day.fullDate} className="border rounded-lg">
            <div className="bg-secondary text-white p-2 font-semibold">
              {format(new Date(day.fullDate), 'EEE, MMM d')}
            </div>
            {staff.map((person) => {
              const shift = currentWeekShifts[person.name]?.[day.fullDate];
              const weeklyHours = calculateWeeklyHours(person.name);
              return (
                <div key={`${person.name}-${day.fullDate}`} className="p-2 border-t">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{person.name}</div>
                      <div className="text-sm text-gray-500">Weekly Hours: {weeklyHours}h</div>
                    </div>
                    {shift ? (
                      <div className="space-y-2">
                        <div className="text-sm">
                          <div>{shift.startTime} - {shift.endTime}</div>
                          <div>{shift.role}</div>
                        </div>
                        {!isPdfGenerating && (
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedStaff(person.name);
                                    setSelectedDate(day.fullDate);
                                    setNewShift(shift);
                                  }}
                                >
                                  <Edit2 className="h-4 w-4" />
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
                              onClick={() => handleDeleteShift(person.name, day.fullDate)}
                            >
                              <Trash2 className="h-4 w-4" />
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
                              size="sm"
                              onClick={() => {
                                setSelectedStaff(person.name);
                                setSelectedDate(day.fullDate);
                              }}
                            >
                              <Plus className="h-4 w-4" />
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
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[150px,repeat(7,minmax(130px,1fr))]">
      <div className="bg-secondary text-white p-2 font-semibold">Staff</div>
      {days.map((day) => (
        <div key={day.fullDate} className="bg-secondary text-white p-2 font-semibold text-center border-l border-white/20">
          {format(new Date(day.fullDate), 'EEE, MMM d')}
        </div>
      ))}

      {staff.map((person) => (
        <React.Fragment key={person.id}>
          <div className="border-t p-2 bg-gray-50">
            <div className="font-medium">{person.name}</div>
            <div className="text-sm text-gray-500">Weekly Hours: {calculateWeeklyHours(person.name)}h</div>
          </div>
          {days.map((day) => {
            const shift = currentWeekShifts[person.name]?.[day.fullDate];
            return (
              <div key={`${person.name}-${day.fullDate}`} className="border-t border-l p-2 min-h-[80px]">
                {shift ? (
                  <div className="bg-primary text-white p-2 rounded-md text-sm space-y-1">
                    <div>{shift.startTime} - {shift.endTime}</div>
                    <div>{shift.role}</div>
                    {!isPdfGenerating && (
                      <div className="flex gap-1">
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
                              <Edit2 className="h-3 w-3" />
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
                          <Trash2 className="h-3 w-3" />
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
                          size="sm"
                          className="w-full h-full"
                          onClick={() => {
                            setSelectedStaff(person.name);
                            setSelectedDate(day.fullDate);
                          }}
                        >
                          <Plus className="h-4 w-4" />
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