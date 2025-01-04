import { supabase } from '@/integrations/supabase/client';
import { ensureStaffExists, getCompanyIdForUser } from './shift.service';

export const saveSchedule = async (schedule: any, userId: string) => {
  try {
    const companyId = await getCompanyIdForUser(userId);
    
    // Process each staff member's shifts
    for (const [staffName, shifts] of Object.entries(schedule)) {
      const staffId = await ensureStaffExists(staffName, companyId);
      
      // Process shifts for this staff member
      for (const [date, shiftData] of Object.entries(shifts as any)) {
        const { startTime, endTime, role } = shiftData as any;
        
        // Save shift to database
        const { error: shiftError } = await supabase
          .from('shifts')
          .insert([{
            staff_id: staffId,
            start_time: `${date} ${startTime}`,
            end_time: `${date} ${endTime}`,
            role: role
          }]);
          
        if (shiftError) throw shiftError;
      }
    }
  } catch (error) {
    console.error('Error saving schedule:', error);
    throw error;
  }
};