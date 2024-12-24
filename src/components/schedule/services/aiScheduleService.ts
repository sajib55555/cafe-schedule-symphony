import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export async function getCompanyProfile() {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('company_id')
    .single();

  if (error) throw error;
  if (!profile?.company_id) {
    throw new Error('Company information not found');
  }

  return profile;
}

export async function generateAISchedule(weekStart: string, companyId: string) {
  const { data, error } = await supabase.functions.invoke('generate-schedule', {
    body: {
      weekStart,
      companyId
    }
  });

  if (error) throw error;
  if (!data) throw new Error('No data received from AI schedule generation');

  return data;
}