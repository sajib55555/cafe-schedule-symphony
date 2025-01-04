import { format } from "date-fns";
import { Staff } from "@/contexts/StaffContext";
import { calculateHours, calculateTotalHours } from '../utils/timeCalculations';
import { updateStaffHours } from './staffService';
import { calculateMonthlyWages, updateMonthlyWagesRecord } from '../utils/wageCalculations';

export const addShift = async (
  selectedStaff: string,
  selectedDate: string,
  newShift: any,
  weekStartStr: string,
  shifts: any,
  staff: Staff[],
  setShifts: (shifts: any) => void,
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>
) => {
  if (!selectedStaff || !selectedDate) return;

  const hours = calculateHours(newShift.startTime, newShift.endTime);
  
  const updatedShifts = {
    ...shifts,
    [weekStartStr]: {
      ...(shifts[weekStartStr] || {}),
      [selectedStaff]: {
        ...(shifts[weekStartStr]?.[selectedStaff] || {}),
        [selectedDate]: newShift
      }
    }
  };

  setShifts(updatedShifts);

  const staffMember = staff.find(person => person.name === selectedStaff);
  if (staffMember) {
    const newTotalHours = calculateTotalHours(selectedStaff, weekStartStr, updatedShifts[weekStartStr]);
    await updateStaffHours(staffMember.id, newTotalHours);

    // Update monthly wages
    const shiftDate = new Date(selectedDate);
    const monthStart = new Date(shiftDate.getFullYear(), shiftDate.getMonth(), 1);
    const monthEnd = new Date(shiftDate.getFullYear(), shiftDate.getMonth() + 1, 0);

    const totalHours = await calculateMonthlyWages(
      staffMember.id,
      staffMember.company_id!,
      monthStart,
      monthEnd
    );

    await updateMonthlyWagesRecord(
      staffMember.id,
      staffMember.company_id!,
      monthStart,
      monthEnd,
      totalHours,
      staffMember.hourly_pay || 0
    );

    setStaff(prev => prev.map(person => {
      if (person.id === staffMember.id) {
        return { ...person, hours: newTotalHours };
      }
      return person;
    }));
  }

  return staffMember;
};

export const editShift = async (
  selectedStaff: string,
  selectedDate: string,
  newShift: any,
  weekStartStr: string,
  shifts: any,
  staff: Staff[],
  setShifts: (shifts: any) => void,
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>
) => {
  if (!selectedStaff || !selectedDate) return;

  const updatedShifts = {
    ...shifts,
    [weekStartStr]: {
      ...(shifts[weekStartStr] || {}),
      [selectedStaff]: {
        ...(shifts[weekStartStr]?.[selectedStaff] || {}),
        [selectedDate]: newShift
      }
    }
  };

  setShifts(updatedShifts);

  const staffMember = staff.find(person => person.name === selectedStaff);
  if (staffMember) {
    const newTotalHours = calculateTotalHours(selectedStaff, weekStartStr, updatedShifts[weekStartStr]);
    await updateStaffHours(staffMember.id, newTotalHours);

    // Update monthly wages
    const shiftDate = new Date(selectedDate);
    const monthStart = new Date(shiftDate.getFullYear(), shiftDate.getMonth(), 1);
    const monthEnd = new Date(shiftDate.getFullYear(), shiftDate.getMonth() + 1, 0);

    const totalHours = await calculateMonthlyWages(
      staffMember.id,
      staffMember.company_id!,
      monthStart,
      monthEnd
    );

    await updateMonthlyWagesRecord(
      staffMember.id,
      staffMember.company_id!,
      monthStart,
      monthEnd,
      totalHours,
      staffMember.hourly_pay || 0
    );

    setStaff(prev => prev.map(person => {
      if (person.id === staffMember.id) {
        return { ...person, hours: newTotalHours };
      }
      return person;
    }));
  }

  return staffMember;
};

export const deleteShift = async (
  staffName: string,
  date: string,
  weekStartStr: string,
  shifts: any,
  staff: Staff[],
  setShifts: (shifts: any) => void,
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>
) => {
  const updatedShifts = { ...shifts };
  if (updatedShifts[weekStartStr]?.[staffName]) {
    const staffShifts = { ...updatedShifts[weekStartStr][staffName] };
    delete staffShifts[date];
    
    if (Object.keys(staffShifts).length === 0) {
      delete updatedShifts[weekStartStr][staffName];
    } else {
      updatedShifts[weekStartStr][staffName] = staffShifts;
    }
  }

  setShifts(updatedShifts);

  const staffMember = staff.find(person => person.name === staffName);
  if (staffMember) {
    const newTotalHours = calculateTotalHours(staffName, weekStartStr, updatedShifts[weekStartStr] || {});
    await updateStaffHours(staffMember.id, newTotalHours);

    // Update monthly wages
    const shiftDate = new Date(date);
    const monthStart = new Date(shiftDate.getFullYear(), shiftDate.getMonth(), 1);
    const monthEnd = new Date(shiftDate.getFullYear(), shiftDate.getMonth() + 1, 0);

    const totalHours = await calculateMonthlyWages(
      staffMember.id,
      staffMember.company_id!,
      monthStart,
      monthEnd
    );

    await updateMonthlyWagesRecord(
      staffMember.id,
      staffMember.company_id!,
      monthStart,
      monthEnd,
      totalHours,
      staffMember.hourly_pay || 0
    );

    setStaff(prev => prev.map(person => {
      if (person.id === staffMember.id) {
        return { ...person, hours: newTotalHours };
      }
      return person;
    }));
  }

  return staffMember;
};