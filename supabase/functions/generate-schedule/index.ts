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

const dayMapping: { [key: number]: string } = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { weekStart, companyId } = await req.json()
    console.log('Received request for weekStart:', weekStart, 'companyId:', companyId);

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

    // Initialize shifts object
    const shifts: { [key: string]: any } = {};
    
    // Process each day of the week
    for (let day = 0; day < 7; day++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + day);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = dayMapping[date.getDay()];
      
      // Get rules for this day
      const dayRules = rules.filter((rule: ScheduleRule) => rule.day_of_week === date.getDay());
      
      // Process each rule
      dayRules.forEach((rule: ScheduleRule) => {
        // Get available staff for this role and day
        const availableStaff = staff.filter((employee: Staff) => {
          return employee.role === rule.role && 
                 employee.availability && 
                 employee.availability.includes(dayName);
        });
        
        // Randomly select staff up to max_staff limit
        const selectedStaff = shuffleArray(availableStaff).slice(0, rule.max_staff);
        
        // Assign shifts to selected staff
        selectedStaff.forEach((employee: Staff) => {
          if (!shifts[employee.name]) {
            shifts[employee.name] = {};
          }
          
          shifts[employee.name][dateStr] = {
            startTime: rule.start_time.substring(0, 5),
            endTime: rule.end_time.substring(0, 5),
            role: employee.role
          };
        });
      });
    }

    const schedule = {
      weekStart,
      shifts
    };

    console.log('Generated schedule:', JSON.stringify(schedule, null, 2));

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

// Helper function to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}