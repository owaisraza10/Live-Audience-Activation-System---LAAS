import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Debugging check
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("CRITICAL: Supabase environment variables are missing!");
  console.log("URL:", supabaseUrl);
  console.log("Key:", supabaseAnonKey);
}

// We provide empty strings as fallbacks so the app doesn't crash on boot 
// if you haven't set the variables yet
export const supabase = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || ''
);