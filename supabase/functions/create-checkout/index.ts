import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@12.5.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const initializeStripe = () => {
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!stripeKey) {
    throw new Error('Missing Stripe secret key');
  }
  return new Stripe(stripeKey, { apiVersion: '2023-10-16' });
};

const initializeSupabase = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      }
    }
  );
};

const getUserEmail = async (supabaseAdmin: any, token: string) => {
  const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError) {
    console.error('Error getting user:', userError);
    throw new Error('Error getting user details');
  }
  if (!user?.email) {
    throw new Error('User email not found');
  }
  return user.email;
};

const getOrCreateCustomer = async (stripe: Stripe, email: string) => {
  const customers = await stripe.customers.list({
    email: email,
    limit: 1,
  });

  if (customers.data.length > 0) {
    console.log('Found existing Stripe customer');
    return customers.data[0].id;
  }

  const newCustomer = await stripe.customers.create({
    email: email,
  });
  console.log('Created new Stripe customer:', newCustomer.id);
  return newCustomer.id;
};

const createCheckoutSession = async (stripe: Stripe, params: {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}) => {
  return await stripe.checkout.sessions.create({
    customer: params.customerId,
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  });
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = initializeStripe();
    console.log('Stripe initialized successfully');

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      throw new Error('Authentication required');
    }

    const supabaseAdmin = initializeSupabase();
    const token = authHeader.replace('Bearer ', '');
    console.log('Processing request for authenticated user');

    const email = await getUserEmail(supabaseAdmin, token);
    console.log('Creating checkout session for email:', email);

    const customerId = await getOrCreateCustomer(stripe, email);

    const { priceId, successUrl, cancelUrl } = await req.json();
    if (!priceId) {
      console.error('No price ID provided');
      throw new Error('Price ID is required');
    }

    const session = await createCheckoutSession(stripe, {
      customerId,
      priceId,
      successUrl: successUrl || `${req.headers.get('origin')}/`,
      cancelUrl: cancelUrl || `${req.headers.get('origin')}/upgrade`,
    });

    console.log('Checkout session created successfully:', session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});