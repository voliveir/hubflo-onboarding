import { NextRequest, NextResponse } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables")
}

const supabase = createSupabaseClient(supabaseUrl, supabaseKey)

// GET - Fetch time entries (optionally filtered by client_id, date range, type)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get("client_id")
    const startDate = searchParams.get("start_date")
    const endDate = searchParams.get("end_date")
    const entryType = searchParams.get("entry_type")

    let query = supabase
      .from("client_time_entries")
      .select("*")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })

    if (clientId) {
      query = query.eq("client_id", clientId)
    }

    if (startDate) {
      query = query.gte("date", startDate)
    }

    if (endDate) {
      query = query.lte("date", endDate)
    }

    if (entryType) {
      query = query.eq("entry_type", entryType)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching time entries:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Error in GET /api/time-entries:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create a new time entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { client_id, entry_type, date, duration_minutes, description, notes, created_by } = body

    if (!client_id || !entry_type || !date || !duration_minutes) {
      return NextResponse.json(
        { error: "Missing required fields: client_id, entry_type, date, duration_minutes" },
        { status: 400 }
      )
    }

    const validTypes = [
      "meeting",
      "email",
      "initial_setup",
      "automation_workflow",
      "api_integration",
      "testing_debugging",
      "training_handoff",
      "revisions_rework",
      "implementation",
    ]
    if (!validTypes.includes(entry_type)) {
      return NextResponse.json(
        { error: `Invalid entry_type. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      )
    }

    if (duration_minutes <= 0) {
      return NextResponse.json(
        { error: "duration_minutes must be greater than 0" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("client_time_entries")
      .insert([
        {
          client_id,
          entry_type,
          date,
          duration_minutes,
          description: description || null,
          notes: notes || null,
          created_by: created_by || null,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating time entry:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/time-entries:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

