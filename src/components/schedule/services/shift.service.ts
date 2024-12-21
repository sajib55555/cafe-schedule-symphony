import { supabase } from "@/integrations/supabase/client";
import { Staff } from "@/contexts/StaffContext";
import { StaffShifts, ShiftToInsert } from "../types/shift.types";
import { format, addDays } from "date-fns";

export async function ensureStaffExists(staffNames: string[]): Promise<void> {
  for (const staffName of staffNames) {
    const { data: existingStaff } = await supabase
      .from('staff')
      .select('id')
      .eq('name', staffName)
      .single();

    if (!existingStaff) {
      const { error: staffError } = await supabase
        .from('staff')
        .insert([{ name: staffName }]);
      
      if (staffError) {
        console.error('Error creating staff member:', staffError);
        throw new Error(`Failed to create staff member ${staffName}`);
      }
    }
  }
}

export async function getUpdatedStaff() {
  const { data: updatedStaff, error: staffError } = await supabase
    .from('staff')
    .select('id, name');
  
  if (staffError) throw staffError;
  return updatedStaff;
}

export async function deleteExistingShifts(startDate: Date, endDate: Date) {
  const { error: deleteError } = await supabase
    .from('shifts')
    .delete()
    .gte('start_time', startDate.toISOString())
    .lt('start_time', endDate.toISOString());

  if (deleteError) throw deleteError;
}

export async function insertShifts(shiftsToInsert: ShiftToInsert[]) {
  if (shiftsToInsert.length === 0) return;
  
  const { error: insertError } = await supabase
    .from('shifts')
    .insert(shiftsToInsert);

  if (insertError) {
    console.error('Insert error:', insertError);
    throw insertError;
  }
}

export function prepareShiftsForInsert(
  currentWeekShifts: StaffShifts,
  updatedStaff: any[],
  weekStartStr: string
): ShiftToInsert[] {
  const shiftsToInsert: ShiftToInsert[] = [];

  for (const [staffName, staffShifts] of Object.entries(currentWeekShifts)) {
    const staffMember = updatedStaff.find(s => s.name === staffName);
    if (!staffMember?.id) {
      console.error(`Staff member ${staffName} not found or has no ID`);
      continue;
    }

    for (const [date, shift] of Object.entries(staffShifts)) {
      shiftsToInsert.push({
        staff_id: staffMember.id,
        start_time: `${date}T${shift.startTime}:00`,
        end_time: `${date}T${shift.endTime}:00`,
        role: shift.role
      });
    }
  }

  return shiftsToInsert;
}