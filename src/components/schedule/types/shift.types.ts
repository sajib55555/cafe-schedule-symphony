export interface Shift {
  startTime: string;
  endTime: string;
  role: 'Barista' | 'Floor';
}

export interface StaffShifts {
  [staffName: string]: {
    [date: string]: Shift;
  };
}

export interface ShiftToInsert {
  staff_id: number;
  start_time: string;
  end_time: string;
  role: string;
}