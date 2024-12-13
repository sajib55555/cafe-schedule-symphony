import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, addDays, startOfWeek, addWeeks, subWeeks } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

export function WeeklySchedule() {
  const { toast } = useToast();
  const [selectedWeekStart, setSelectedWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [shifts, setShifts] = useState<{ [weekStart: string]: StaffShifts }>({});
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [newShift, setNewShift] = useState<Shift>({
    startTime: '09:00',
    endTime: '17:00',
    role: 'Barista'
  });

  const staff = [
    { name: 'Courtney', hours: 17 },
    { name: 'Saj', hours: 55 },
    { name: 'Tia', hours: 23 },
    { name: 'Lucy', hours: 15.5 },
    { name: 'Nick', hours: 9 },
    { name: 'Niloufar', hours: 23.5 }
  ];

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

    toast({
      title: "Shift Added",
      description: `Added shift for ${selectedStaff} on ${format(new Date(selectedDate), 'EEE, MMM d')}`,
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setSelectedWeekStart(current => 
      direction === 'prev' ? subWeeks(current, 1) : addWeeks(current, 1)
    );
  };

  const currentWeekShifts = shifts[format(selectedWeekStart, 'yyyy-MM-dd')] || {};

  return (
    <div className="space-y-4">
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
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-[200px,repeat(7,1fr)]">
          <div className="bg-secondary text-white p-4 font-semibold">Staff</div>
          {days.map((day) => (
            <div key={day.fullDate} className="bg-secondary text-white p-4 font-semibold text-center border-l border-white/20">
              {day.name}
            </div>
          ))}

          {staff.map((person) => (
            <React.Fragment key={person.name}>
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
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Shift for {person.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Start Time</label>
                                <Input
                                  type="time"
                                  value={newShift.startTime}
                                  onChange={(e) => setNewShift(prev => ({ ...prev, startTime: e.target.value }))}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">End Time</label>
                                <Input
                                  type="time"
                                  value={newShift.endTime}
                                  onChange={(e) => setNewShift(prev => ({ ...prev, endTime: e.target.value }))}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Role</label>
                              <select
                                className="w-full border rounded-md p-2"
                                value={newShift.role}
                                onChange={(e) => setNewShift(prev => ({ 
                                  ...prev, 
                                  role: e.target.value as 'Barista' | 'Floor'
                                }))}
                              >
                                <option value="Barista">Barista</option>
                                <option value="Floor">Floor</option>
                              </select>
                            </div>
                            <Button className="w-full" onClick={handleAddShift}>
                              Add Shift
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}