import { useAIScheduleState } from './useAIScheduleState';
import { StaffShifts } from '../types';

export const useAISchedule = (
  selectedWeekStart: Date,
  setShifts: React.Dispatch<React.SetStateAction<{ [weekStart: string]: StaffShifts }>>,
  handleSaveSchedule: () => Promise<void>
) => {
  return useAIScheduleState(selectedWeekStart, setShifts, handleSaveSchedule);
};