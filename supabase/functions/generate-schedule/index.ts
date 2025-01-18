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
    console.log('Request params:', { weekStart, companyId });

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
            content: `You are a scheduling assistant. Generate a schedule in this exact JSON format:
{
  "shifts": {
    "staffName": {
      "YYYY-MM-DD": {
        "startTime": "HH:MM",
        "endTime": "HH:MM",
        "role": "Barista"
      }
    }
  }
}
Only return the JSON object, no additional text or formatting.`
          },
          {
            role: "user",
            content: `Create a schedule for week starting ${weekStart}. Staff: ${JSON.stringify(staff)}. Rules: ${JSON.stringify(rules)}.`
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
    console.log('OpenAI Response:', aiResponse);
    
    if (!aiResponse.choices?.[0]?.message?.content) {
      console.error('Invalid AI response format:', aiResponse);
      throw new Error('Invalid AI response format');
    }

    let schedule;
    try {
      // Clean the content to ensure it's valid JSON
      const content = aiResponse.choices[0].message.content.trim();
      console.log('Raw content:', content);
      
      // Remove any markdown formatting and extract just the JSON
      const jsonContent = content
        .replace(/```json\n?|\n?```/g, '')
        .replace(/^[^{]*({.*})[^}]*$/, '$1')
        .trim();
      
      console.log('Cleaned JSON content:', jsonContent);
      schedule = JSON.parse(jsonContent);
      
      // Validate the schedule structure
      if (!schedule?.shifts) {
        throw new Error('Invalid schedule structure - missing shifts property');
      }

      // Validate each shift
      for (const [staffName, dates] of Object.entries(schedule.shifts)) {
        for (const [date, shift] of Object.entries(dates as Record<string, any>)) {
          if (!shift?.startTime || !shift?.endTime || !shift?.role) {
            throw new Error(`Invalid shift structure for ${staffName} on ${date}`);
          }
          
          // Validate time format (HH:MM)
          const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
          if (!timeRegex.test(shift.startTime) || !timeRegex.test(shift.endTime)) {
            throw new Error(`Invalid time format for ${staffName} on ${date}`);
          }
          
          // Validate role
          if (shift.role !== 'Barista' && shift.role !== 'Floor') {
            throw new Error(`Invalid role for ${staffName} on ${date}`);
          }
        }
      }

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

      console.log('Successfully saved schedule:', schedule);
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