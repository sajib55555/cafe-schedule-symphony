import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://jsjpqmuitxifxeiqrouo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzanBxbXVpdHhpZnhlaXFyb3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxMjYyNDksImV4cCI6MjA0OTcwMjI0OX0.Tz6xth70QiJ_tSFTJKYO6MkW7KLqWTPgluG8oYlvdq0";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});