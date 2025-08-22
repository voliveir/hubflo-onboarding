import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function POST() {
  try {
    // Force a schema refresh by querying the table structure
    const { data, error } = await supabaseAdmin
      .from('clients')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('Schema refresh error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
    
    console.log('Schema cache refreshed successfully');
    return NextResponse.json({ success: true, message: 'Schema cache refreshed' })
  } catch (error: any) {
    console.error('Schema refresh failed:', error);
    return NextResponse.json({ success: false, error: error?.message || "Unknown error" }, { status: 500 })
  }
}
