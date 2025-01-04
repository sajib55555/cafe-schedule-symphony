import { supabase } from '@/integrations/supabase/client';
import { Staff } from '@/contexts/StaffContext';

export const ensureStaffExists = async (staffName: string) => {
  const { data: existingStaff, error: queryError } = await supabase
    .from('staff')
    .select('id')
    .eq('name', staffName)
    .maybeSingle();

  if (queryError) throw queryError;
  return existingStaff?.id;
};

export const getUpdatedStaff = async () => {
  const { data: staff, error } = await supabase
    .from('staff')
    .select('*');
  
  if (error) throw error;
  return staff || [];
};

export const deleteExistingShifts = async (startDate: Date, endDate: Date) => {
  const { error } = await supabase
    .from('shifts')
    .delete()
    .gte('start_time', startDate.toISOString())
    .lt('start_time', endDate.toISOString());

  if (error) throw error;
};

export const insertShifts = async (shifts: any[]) => {
  const { error } = await supabase
    .from('shifts')
    .insert(shifts);

  if (error) throw error;
};

export const prepareShiftsForInsert = (
  currentWeekShifts: any,
  staff: any[],
  weekStartStr: string
) => {
  const shiftsToInsert: any[] = [];

  Object.entries(currentWeekShifts).forEach(([staffName, dates]: [string, any]) => {
    const staffMember = staff.find(s => s.name === staffName);
    if (!staffMember) return;

    Object.entries(dates).forEach(([date, shift]: [string, any]) => {
      shiftsToInsert.push({
        staff_id: staffMember.id,
        start_time: `${date}T${shift.startTime}`,
        end_time: `${date}T${shift.endTime}`,
        role: shift.role
      });
    });
  });

  return shiftsToInsert;
};