import { NextRequest, NextResponse } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables")
}

const supabase = createSupabaseClient(supabaseUrl, supabaseKey)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

// OPTIONS - CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

// PATCH - Update client assignment for an activity
// When assigning a client, creates a time entry so time counts toward that client
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { client_id, is_hidden } = body

    if (!id) {
      return NextResponse.json(
        { error: "Missing activity id" },
        { status: 400, headers: corsHeaders }
      )
    }

    // Fetch current activity
    const { data: activity, error: fetchError } = await supabase
      .from("browser_activity")
      .select("id, url, domain, page_title, started_at, ended_at, duration_seconds, client_id, time_entry_id")
      .eq("id", id)
      .single()

    if (fetchError || !activity) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404, headers: corsHeaders })
    }

    const updates: Record<string, unknown> = {}

    if (is_hidden !== undefined) {
      updates.is_hidden = !!is_hidden
    }

    if (client_id !== undefined) {
      let timeEntryId: string | null = null

      if (activity.time_entry_id) {
        await supabase.from("client_time_entries").delete().eq("id", activity.time_entry_id)
      }

      if (client_id) {
        const date = new Date(activity.started_at).toISOString().split("T")[0]
        const durationMinutes = Math.max(1, Math.ceil(activity.duration_seconds / 60))
        const description = activity.page_title || activity.domain || activity.url || "Browser activity"

        const { data: newEntry, error: insertError } = await supabase
          .from("client_time_entries")
          .insert({
            client_id,
            entry_type: "implementation",
            date,
            duration_minutes: durationMinutes,
            description,
            notes: `From Activity Timeline: ${activity.domain || "browser"}`,
          })
          .select("id")
          .single()

        if (!insertError && newEntry) {
          timeEntryId = newEntry.id
        }
      }

      updates.client_id = client_id || null
      updates.time_entry_id = timeEntryId
    }

    const { data, error } = await supabase
      .from("browser_activity")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating browser activity:", error)
      return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })
    }

    return NextResponse.json(data, { headers: corsHeaders })
  } catch (error) {
    console.error("Error in PATCH /api/browser-activity/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders })
  }
}
