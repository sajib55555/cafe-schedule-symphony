import { supabase } from '@/integrations/supabase/client';

export const ensureStaffExists = async (staffName: string, companyId: string) => {
  try {
    // First check if staff exists
    const { data: existingStaff, error: queryError } = await supabase
      .from('staff')
      .select('id')
      .eq('name', staffName)
      .eq('company_id', companyId)
      .maybeSingle();

    if (queryError) throw queryError;

    // If staff exists, return their ID
    if (existingStaff) {
      return existingStaff.id;
    }

    // If staff doesn't exist, create them
    const { data: newStaff, error: insertError } = await supabase
      .from('staff')
      .insert([
        {
          name: staffName,
          company_id: companyId,
          role: 'Generated from Schedule', // Default role
          availability: [], // Empty availability
          hours: 0,
          hourly_pay: 0
        }
      ])
      .select('id')
      .maybeSingle();

    if (insertError) throw insertError;
    if (!newStaff) throw new Error('Failed to create staff member');

    return newStaff.id;
  } catch (error) {
    console.error('Error creating staff member:', error);
    throw new Error(`Failed to create staff member ${staffName}`);
  }
};

export const getCompanyIdForUser = async (userId: string): Promise<string> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data?.company_id) throw new Error('No company ID found for user');

  return data.company_id;
};