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

    // Use OpenAI to generate the schedule
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a scheduling assistant that creates optimal weekly schedules for a café. 
            You must return ONLY a valid JSON object with no additional text or markdown formatting.
            The response must follow this exact structure:
            {
              "weekStart": "YYYY-MM-DD",
              "shifts": {
                "staffName": {
                  "YYYY-MM-DD": {
                    "startTime": "HH:MM",
                    "endTime": "HH:MM",
                    "role": "role"
                  }
                }
              }
            }`
          },
          {
            role: "user",
            content: `Create a weekly schedule starting from ${weekStart} with these parameters:
            Staff: ${JSON.stringify(staff)}
            Schedule Rules: ${JSON.stringify(rules)}
            
            Remember to return ONLY the JSON object with no additional text or formatting.`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    const aiResponse = await openAIResponse.json();
    console.log('AI Response:', aiResponse);
    
    if (!aiResponse.choices?.[0]?.message?.content) {
      throw new Error('Invalid AI response format');
    }

    let schedule;
    try {
      const content = aiResponse.choices[0].message.content.trim();
      // Remove any markdown formatting if present
      const jsonContent = content.replace(/```json\n?|\n?```/g, '');
      schedule = JSON.parse(jsonContent);
      
      // Validate schedule structure
      if (!schedule.weekStart || !schedule.shifts) {
        throw new Error('Invalid schedule structure');
      }
    } catch (error) {
      console.error('Error parsing AI response:', error);
      console.log('Raw AI response content:', aiResponse.choices[0].message.content);
      throw new Error('Failed to parse AI generated schedule');
    }

    return new Response(
      JSON.stringify(schedule),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      },
    )
  }
})