import React, { createContext, useContext, useState } from 'react';
import { startOfWeek } from "date-fns";
import { Staff } from '@/contexts/StaffContext';

interface ScheduleContextType {
  selectedWeekStart: Date;
  setSelectedWeekStart: (date: Date) => void;
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
  isPdfGenerating: boolean;
  setIsPdfGenerating: (generating: boolean) => void;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const useScheduleContext = () => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useScheduleContext must be used within a ScheduleProvider');
  }
  return context;
};

export const ScheduleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  return (
    <ScheduleContext.Provider value={{
      selectedWeekStart,
      setSelectedWeekStart,
      selectedStaff,
      setSelectedStaff,
      selectedDate,
      setSelectedDate,
      newShift,
      setNewShift,
      isPdfGenerating,
      setIsPdfGenerating,
    }}>
      {children}
    </ScheduleContext.Provider>
  );
};