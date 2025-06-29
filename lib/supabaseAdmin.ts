// This file should only be imported in server-side code. Never import in client/browser code!
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing Supabase admin environment variables")
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)
// Note: Only use this on the server, never in client-side code! 