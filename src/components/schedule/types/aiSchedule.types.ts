import { StaffShifts } from '../types';

export interface AISchedule {
  id: number;
  company_id: string;
  week_start: string;
  schedule_data: StaffShifts;
  created_at: string;
}

export interface AIScheduleHistoryProps {
  onLoadSchedule: (scheduleData: StaffShifts) => void;
}