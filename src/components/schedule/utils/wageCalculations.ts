import { format, differenceInHours, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

export const calculateMonthlyWages = async (
  staffId: number,
  companyId: string,
  monthStart: Date,
  monthEnd: Date
) => {
  // Fetch all shifts for the staff member within the month
  const { data: monthShifts, error: shiftsError } = await supabase
    .from('shifts')
    .select('*')
    .eq('staff_id', staffId)
    .gte('start_time', format(monthStart, "yyyy-MM-dd'T'HH:mm:ssXXX"))
    .lte('end_time', format(monthEnd, "yyyy-MM-dd'T'HH:mm:ssXXX"));

  if (shiftsError) {
    console.error('Error fetching shifts:', shiftsError);
    throw shiftsError;
  }

  // Calculate total hours from all shifts
  const totalHours = monthShifts?.reduce((acc, shift) => {
    const startTime = parseISO(shift.start_time);
    const endTime = parseISO(shift.end_time);
    const hours = differenceInHours(endTime, startTime);
    return acc + hours;
  }, 0) || 0;

  return totalHours;
};

export const updateMonthlyWagesRecord = async (
  staffId: number,
  companyId: string,
  monthStart: Date,
  monthEnd: Date,
  totalHours: number,
  hourlyPay: number
) => {
  const totalWages = totalHours * hourlyPay;

  // First check if a record already exists
  const { data: existing, error: fetchError } = await supabase
    .from('monthly_wages')
    .select('id')
    .eq('staff_id', staffId)
    .eq('company_id', companyId)  // Added company_id to the query
    .eq('month_start', format(monthStart, 'yyyy-MM-dd'))
    .eq('month_end', format(monthEnd, 'yyyy-MM-dd'))
    .maybeSingle();

  if (fetchError) {
    console.error('Error fetching existing record:', fetchError);
    throw fetchError;
  }

  if (existing) {
    const { error: updateError } = await supabase
      .from('monthly_wages')
      .update({
        total_hours: totalHours,
        total_wages: totalWages,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id);

    if (updateError) {
      console.error('Error updating monthly wages:', updateError);
      throw updateError;
    }
  } else {
    const { error: insertError } = await supabase
      .from('monthly_wages')
      .insert({
        staff_id: staffId,
        company_id: companyId,  // Ensure company_id is included in insert
        month_start: format(monthStart, 'yyyy-MM-dd'),
        month_end: format(monthEnd, 'yyyy-MM-dd'),
        total_hours: totalHours,
        total_wages: totalWages
      });

    if (insertError) {
      console.error('Error inserting monthly wages:', insertError);
      throw insertError;
    }
  }
};