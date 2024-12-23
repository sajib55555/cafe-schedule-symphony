import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Staff {
  id: number;
  name: string;
  role: string;
  availability: string[];
  hours: number;
}

interface ScheduleRule {
  role: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  min_staff: number;
  max_staff: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { weekStart, companyId } = await req.json()

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch staff and rules
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('*')
      .eq('company_id', companyId)

    if (staffError) throw staffError;

    const { data: rules, error: rulesError } = await supabase
      .from('schedule_rules')
      .select('*')
      .eq('company_id', companyId)

    if (rulesError) throw rulesError;

    console.log('Staff data:', staff);
    console.log('Rules data:', rules);

    // Generate a basic schedule based on staff and rules
    const shifts: { [key: string]: any } = {};
    
    // For each staff member
    staff.forEach((employee: Staff) => {
      shifts[employee.name] = {};
      
      // For each day of the week (0-6, where 0 is Monday)
      for (let day = 0; day < 7; day++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + day);
        const dateStr = date.toISOString().split('T')[0];
        
        // Find applicable rules for this day and staff role
        const dayRules = rules.filter((rule: ScheduleRule) => 
          rule.day_of_week === day && rule.role === employee.role
        );
        
        if (dayRules.length > 0) {
          // Use the first applicable rule
          const rule = dayRules[0];
          shifts[employee.name][dateStr] = {
            startTime: rule.start_time.slice(0, 5), // Format: HH:mm
            endTime: rule.end_time.slice(0, 5),     // Format: HH:mm
            role: employee.role
          };
        }
      }
    });

    const schedule = {
      weekStart,
      shifts
    };

    console.log('Generated schedule:', schedule);

    return new Response(
      JSON.stringify(schedule),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      },
    );
  }
});