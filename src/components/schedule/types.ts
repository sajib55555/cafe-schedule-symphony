export interface Shift {
  startTime: string;
  endTime: string;
  role: 'Barista' | 'Floor';
}

export interface StaffShifts {
  [key: string]: {
    [key: string]: Shift;
  };
}

export interface ShiftFormData {
  startTime: string;
  endTime: string;
  role: 'Barista' | 'Floor';
}