import { NextRequest, NextResponse } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables")
}

const supabase = createSupabaseClient(supabaseUrl, supabaseKey)

// GET - Fetch activity groups for a date range (with their activities)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("start_date")
    const endDate = searchParams.get("end_date")
    const includeHidden = searchParams.get("include_hidden") === "true"

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing start_date and end_date (ISO strings)" },
        { status: 400 }
      )
    }

    let actQuery = supabase
      .from("browser_activity")
      .select("*")
      .not("group_id", "is", null)
      .lte("started_at", endDate)
      .gte("ended_at", startDate)
      .order("started_at", { ascending: true })

    if (!includeHidden) {
      actQuery = actQuery.or("is_hidden.is.null,is_hidden.eq.false")
    }

    const { data: activities, error: actError } = await actQuery

    if (actError) {
      console.error("Error fetching grouped activities:", actError)
      return NextResponse.json({ error: actError.message }, { status: 500 })
    }

    const groupIds = [...new Set((activities || []).map((a) => a.group_id).filter(Boolean))] as string[]
    if (groupIds.length === 0) {
      return NextResponse.json([])
    }

    const { data: groupRows } = await supabase
      .from("activity_groups")
      .select("*")
      .in("id", groupIds)

    const groupById = new Map((groupRows || []).map((g) => [g.id, g]))
    const groupMap = new Map<
      string,
      { id: string; client_id: string | null; time_entry_id: string | null; name: string | null; category: string | null; client_label: string | null; activities: any[] }
    >()

    for (const a of activities || []) {
      const gid = a.group_id as string
      const g = groupById.get(gid)
      if (!groupMap.has(gid)) {
        groupMap.set(gid, {
          id: gid,
          client_id: g?.client_id ?? null,
          time_entry_id: g?.time_entry_id ?? null,
          name: g?.name ?? null,
          category: g?.category ?? null,
          client_label: g?.client_label ?? null,
          activities: [],
        })
      }
      groupMap.get(gid)!.activities.push(a)
    }

    const groups = Array.from(groupMap.values()).filter((g) => g.activities.length > 0)
    return NextResponse.json(groups)
  } catch (error) {
    console.error("Error in GET /api/activity-groups:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create a group from activity IDs
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { activity_ids } = body

    if (!Array.isArray(activity_ids) || activity_ids.length === 0) {
      return NextResponse.json(
        { error: "activity_ids must be a non-empty array" },
        { status: 400 }
      )
    }

    const { data: group, error: groupError } = await supabase
      .from("activity_groups")
      .insert({})
      .select()
      .single()

    if (groupError || !group) {
      console.error("Error creating group:", groupError)
      return NextResponse.json({ error: groupError?.message || "Failed to create group" }, { status: 500 })
    }

    const { error: updateError } = await supabase
      .from("browser_activity")
      .update({ group_id: group.id, client_id: null })
      .in("id", activity_ids)

    if (updateError) {
      await supabase.from("activity_groups").delete().eq("id", group.id)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    const { data: activities } = await supabase
      .from("browser_activity")
      .select("*")
      .in("id", activity_ids)
      .order("started_at", { ascending: true })

    return NextResponse.json({ ...group, activities: activities || [] })
  } catch (error) {
    console.error("Error in POST /api/activity-groups:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
