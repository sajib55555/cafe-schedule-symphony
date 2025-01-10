import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
            Follow these specific staffing requirements:
            
            Monday to Friday:
            - 1 Floor Staff
            - 1 Barista
            - 1 Waiter

            Saturday and Sunday:
            - 2 Floor Staff
            - 1 Barista
            - 2 Waiters

            You must return ONLY a valid JSON object with no additional text or markdown formatting.
            The response must follow this exact structure:
            {
              "shifts": {
                "staffName": {
                  "YYYY-MM-DD": {
                    "startTime": "HH:MM",
                    "endTime": "HH:MM",
                    "role": "role"
                  }
                }
              }
            }

            Make sure to:
            1. Assign roles based on staff members' primary roles
            2. Respect staff availability
            3. Distribute hours fairly
            4. Follow the weekday/weekend staffing requirements strictly
            5. Use standard shift times (e.g., 8-hour shifts between 09:00-17:00)
            6. Ensure each day has the exact number of staff members per role as specified above`
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
      if (!schedule.shifts) {
        throw new Error('Invalid schedule structure');
      }

      // Save the AI-generated schedule
      const { error: insertError } = await supabase
        .from('ai_schedules')
        .insert({
          company_id: companyId,
          week_start: weekStart,
          schedule_data: schedule.shifts
        });

      if (insertError) throw insertError;

      console.log('Parsed schedule:', schedule);
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