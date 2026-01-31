import { NextRequest, NextResponse } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables")
}

const supabase = createSupabaseClient(supabaseUrl, supabaseKey)

// PATCH - Assign client to group (creates time entry), add/remove activities
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { client_id, add_activity_ids, remove_activity_ids } = body

    const { data: group, error: fetchError } = await supabase
      .from("activity_groups")
      .select("*")
      .eq("id", id)
      .single()

    if (fetchError || !group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    if (add_activity_ids?.length) {
      await supabase
        .from("browser_activity")
        .update({ group_id: id, client_id: null })
        .in("id", add_activity_ids)
    }

    if (remove_activity_ids?.length) {
      await supabase
        .from("browser_activity")
        .update({ group_id: null })
        .in("id", remove_activity_ids)
    }

    if (client_id !== undefined) {
      const { data: activities } = await supabase
        .from("browser_activity")
        .select("id, started_at, ended_at, duration_seconds, page_title, domain, url")
        .eq("group_id", id)
        .order("started_at", { ascending: true })

      if (group.time_entry_id) {
        await supabase.from("client_time_entries").delete().eq("id", group.time_entry_id)
      }

      let timeEntryId: string | null = null
      if (client_id) {
        const totalSeconds = (activities || []).reduce((s, a) => s + a.duration_seconds, 0)
        const date = new Date((activities || [])[0]?.started_at || new Date()).toISOString().split("T")[0]
        const desc = (activities || []).map((a) => a.page_title || a.domain || "Browser").slice(0, 3).join(", ")

        const { data: entry } = await supabase
          .from("client_time_entries")
          .insert({
            client_id,
            entry_type: "implementation",
            date,
            duration_minutes: Math.max(1, Math.ceil(totalSeconds / 60)),
            description: `Grouped: ${desc}${(activities?.length || 0) > 3 ? "..." : ""}`,
            notes: `${activities?.length || 0} activities grouped`,
          })
          .select("id")
          .single()

        if (entry) timeEntryId = entry.id
      }

      await supabase
        .from("activity_groups")
        .update({ client_id: client_id || null, time_entry_id: timeEntryId })
        .eq("id", id)
    }

    const { data: updated } = await supabase
      .from("activity_groups")
      .select("*")
      .eq("id", id)
      .single()

    const { data: groupActivities } = await supabase
      .from("browser_activity")
      .select("*")
      .eq("group_id", id)
      .order("started_at", { ascending: true })

    return NextResponse.json({ ...updated, activities: groupActivities || [] })
  } catch (error) {
    console.error("Error in PATCH /api/activity-groups/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Ungroup: remove group_id from activities, delete group and time entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: group } = await supabase.from("activity_groups").select("time_entry_id").eq("id", id).single()

    await supabase.from("browser_activity").update({ group_id: null }).eq("group_id", id)
    if (group?.time_entry_id) {
      await supabase.from("client_time_entries").delete().eq("id", group.time_entry_id)
    }
    await supabase.from("activity_groups").delete().eq("id", id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/activity-groups/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
