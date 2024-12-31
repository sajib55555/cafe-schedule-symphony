import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SupportRequest {
  reason: string;
  message: string;
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reason, message, userId } = await req.json() as SupportRequest;

    // Get user details from the database
    const { data: userProfile } = await supabaseAdmin
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single();

    if (!userProfile) {
      throw new Error("User not found");
    }

    const emailHtml = `
      <h2>New Support Request</h2>
      <p><strong>From:</strong> ${userProfile.full_name} (${userProfile.email})</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Cafe Schedule Manager <support@your-domain.com>",
        to: ["support@your-domain.com"],
        subject: `Support Request: ${reason}`,
        html: emailHtml,
        reply_to: userProfile.email,
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to send email");
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in send-support-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
};

serve(handler);