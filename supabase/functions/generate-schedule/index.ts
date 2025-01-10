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
    console.log('Received request with weekStart:', weekStart, 'companyId:', companyId);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch staff and rules
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('*')
      .eq('company_id', companyId)

    if (staffError) {
      console.error('Staff fetch error:', staffError);
      throw staffError;
    }

    const { data: rules, error: rulesError } = await supabase
      .from('schedule_rules')
      .select('*')
      .eq('company_id', companyId)

    if (rulesError) {
      console.error('Rules fetch error:', rulesError);
      throw rulesError;
    }

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
        model: "gpt-4o-mini",
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

    if (!openAIResponse.ok) {
      console.error('OpenAI API error:', await openAIResponse.text());
      throw new Error('Failed to get response from OpenAI');
    }

    const aiResponse = await openAIResponse.json();
    console.log('Raw AI Response:', aiResponse);
    
    if (!aiResponse.choices?.[0]?.message?.content) {
      throw new Error('Invalid AI response format');
    }

    let schedule;
    try {
      const content = aiResponse.choices[0].message.content.trim();
      // Remove any markdown formatting if present
      const jsonContent = content.replace(/```json\n?|\n?```/g, '');
      console.log('Cleaned JSON content:', jsonContent);
      
      schedule = JSON.parse(jsonContent);
      
      // Validate schedule structure
      if (!schedule.shifts) {
        console.error('Invalid schedule structure:', schedule);
        throw new Error('Invalid schedule structure - missing shifts property');
      }

      // Validate each shift
      Object.entries(schedule.shifts).forEach(([staffName, dates]: [string, any]) => {
        Object.entries(dates).forEach(([date, shift]: [string, any]) => {
          if (!shift.startTime || !shift.endTime || !shift.role) {
            throw new Error(`Invalid shift structure for ${staffName} on ${date}`);
          }
        });
      });

      // Save the AI-generated schedule
      const { error: insertError } = await supabase
        .from('ai_schedules')
        .insert({
          company_id: companyId,
          week_start: weekStart,
          schedule_data: schedule.shifts
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }

      console.log('Successfully parsed and saved schedule:', schedule);
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