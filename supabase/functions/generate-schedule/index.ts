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
            content: `Generate a valid JSON schedule object with this exact structure:
{
  "shifts": {
    "staffName": {
      "YYYY-MM-DD": {
        "startTime": "HH:MM",
        "endTime": "HH:MM",
        "role": "Barista or Floor"
      }
    }
  }
}
Do not include any additional text, markdown formatting, or explanations. Return only the JSON object.`
          },
          {
            role: "user",
            content: `Create a schedule for week starting ${weekStart}. Staff data: ${JSON.stringify(staff)}. Rules: ${JSON.stringify(rules)}.`
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
      const content = aiResponse.choices[0].message.content.trim();
      console.log('Raw content:', content);
      
      // Clean the content to ensure it's valid JSON
      const jsonContent = content
        .replace(/```json\n?|\n?```/g, '')  // Remove markdown code blocks
        .replace(/^[^{]*({.*})[^}]*$/, '$1') // Extract just the JSON object
        .trim();
      
      console.log('Cleaned JSON content:', jsonContent);
      
      schedule = JSON.parse(jsonContent);
      console.log('Parsed schedule:', schedule);
      
      // Validate the schedule structure
      if (!schedule?.shifts) {
        console.error('Missing shifts property:', schedule);
        throw new Error('Invalid schedule structure - missing shifts property');
      }

      // Validate each shift
      for (const [staffName, dates] of Object.entries(schedule.shifts)) {
        for (const [date, shift] of Object.entries(dates as Record<string, any>)) {
          if (!shift?.startTime || !shift?.endTime || !shift?.role) {
            console.error('Invalid shift data:', { staffName, date, shift });
            throw new Error(`Invalid shift structure for ${staffName} on ${date}`);
          }
          
          // Validate time format
          if (!/^\d{2}:\d{2}$/.test(shift.startTime) || !/^\d{2}:\d{2}$/.test(shift.endTime)) {
            console.error('Invalid time format:', { staffName, date, shift });
            throw new Error(`Invalid time format for ${staffName} on ${date}`);
          }
          
          // Validate role
          if (!['Barista', 'Floor'].includes(shift.role)) {
            console.error('Invalid role:', { staffName, date, shift });
            throw new Error(`Invalid role for ${staffName} on ${date}. Must be either 'Barista' or 'Floor'`);
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