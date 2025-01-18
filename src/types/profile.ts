export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string | null;
  created_at: string;
  trial_start: string | null;
  trial_end: string | null;
  company_id: string | null;
  subscription_status: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_price_id: string | null;
  currency_symbol: string | null;
  position: string | null;
  department: string | null;
  phone: string | null;
}