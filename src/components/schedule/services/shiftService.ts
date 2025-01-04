import { supabase } from '@/integrations/supabase/client';
import { Staff } from '@/contexts/StaffContext';
import { format } from "date-fns";

export const addShift = async (
  selectedStaff: string,
  selectedDate: string,
  newShift: any,
  weekStartStr: string,
  shifts: any,
  staff: Staff[],
  setShifts: any,
  setStaff: any
) => {
  const staffMember = staff.find(s => s.name === selectedStaff);
  if (!staffMember) return null;

  const updatedShifts = {
    ...shifts,
    [weekStartStr]: {
      ...shifts[weekStartStr] || {},
      [selectedStaff]: {
        ...shifts[weekStartStr]?.[selectedStaff] || {},
        [selectedDate]: newShift
      }
    }
  };

  setShifts(updatedShifts);
  return staffMember;
};

export const editShift = async (
  selectedStaff: string,
  selectedDate: string,
  newShift: any,
  weekStartStr: string,
  shifts: any,
  staff: Staff[],
  setShifts: any,
  setStaff: any
) => {
  const staffMember = staff.find(s => s.name === selectedStaff);
  if (!staffMember) return null;

  const updatedShifts = {
    ...shifts,
    [weekStartStr]: {
      ...shifts[weekStartStr],
      [selectedStaff]: {
        ...shifts[weekStartStr][selectedStaff],
        [selectedDate]: newShift
      }
    }
  };

  setShifts(updatedShifts);
  return staffMember;
};

export const deleteShift = async (
  staffName: string,
  date: string,
  weekStartStr: string,
  shifts: any,
  staff: Staff[],
  setShifts: any,
  setStaff: any
) => {
  const staffMember = staff.find(s => s.name === staffName);
  if (!staffMember) return null;

  const updatedShifts = {
    ...shifts,
    [weekStartStr]: {
      ...shifts[weekStartStr]
    }
  };

  if (updatedShifts[weekStartStr][staffName]) {
    delete updatedShifts[weekStartStr][staffName][date];
  }

  setShifts(updatedShifts);
  return staffMember;
};