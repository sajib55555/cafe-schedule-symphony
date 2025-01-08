import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@1.1.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SupportRequest {
  reason: string
  message: string
  userId: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Processing support request...')
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables')
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Get request body
    const requestBody = await req.json()
    console.log('Request body:', requestBody)

    const { reason, message, userId }: SupportRequest = requestBody

    if (!reason || !message || !userId) {
      console.error('Missing required fields:', { reason, message, userId })
      throw new Error('Missing required fields')
    }

    console.log('Fetching user profile for ID:', userId)

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError || !userProfile) {
      console.error('Error fetching user profile:', profileError)
      throw new Error('Failed to fetch user profile')
    }

    console.log('User profile found:', userProfile)

    // Construct email HTML
    const emailHtml = `
      <h2>Support Request</h2>
      <p><strong>From:</strong> ${userProfile.full_name} (${userProfile.email})</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `

    console.log('Sending email via Resend...')

    // Send email using Resend
    const { data: emailResponse, error: emailError } = await resend.emails.send({
      from: "Cafe Schedule Manager <onboarding@resend.dev>",
      to: ["sajibulislam55@gmail.com"],
      subject: `Support Request: ${reason}`,
      html: emailHtml,
      reply_to: userProfile.email,
    })

    if (emailError) {
      console.error('Resend API Error:', emailError)
      throw new Error(`Failed to send email: ${JSON.stringify(emailError)}`)
    }

    console.log('Email sent successfully:', emailResponse)

    return new Response(
      JSON.stringify({ message: 'Support request sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error processing support request:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})