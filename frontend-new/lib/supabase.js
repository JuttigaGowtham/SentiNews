import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const isValidUrl = (url) => {
  return url.startsWith("http://") || url.startsWith("https://");
};

export const supabase = (
  isValidUrl(supabaseUrl) && 
  !supabaseUrl.includes("your_supabase_url") && 
  !supabaseUrl.includes("your-supabase-project")
)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
