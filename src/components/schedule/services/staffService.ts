import { supabase } from '@/integrations/supabase/client';

export const updateStaffHours = async (staffId: number, newHours: number) => {
  const { error } = await supabase
    .from('staff')
    .update({ hours: newHours })
    .eq('id', staffId);

  if (error) {
    console.error('Error updating staff hours:', error);
    throw error;
  }
};