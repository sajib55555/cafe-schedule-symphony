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

export interface AISchedule {
  id: number;
  company_id: string;
  week_start: string;
  schedule_data: StaffShifts;
  created_at: string;
}