import { NextRequest, NextResponse } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables")
}

const supabase = createSupabaseClient(supabaseUrl, supabaseKey)

// GET - Fetch a single time entry by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data, error } = await supabase
      .from("client_time_entries")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Time entry not found" }, { status: 404 })
      }
      console.error("Error fetching time entry:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in GET /api/time-entries/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT - Update a time entry
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { entry_type, date, duration_minutes, description, notes } = body

    const updates: any = {
      updated_at: new Date().toISOString(),
    }

    if (entry_type !== undefined) {
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
      updates.entry_type = entry_type
    }

    if (date !== undefined) {
      updates.date = date
    }

    if (duration_minutes !== undefined) {
      if (duration_minutes <= 0) {
        return NextResponse.json(
          { error: "duration_minutes must be greater than 0" },
          { status: 400 }
        )
      }
      updates.duration_minutes = duration_minutes
    }

    if (description !== undefined) {
      updates.description = description || null
    }

    if (notes !== undefined) {
      updates.notes = notes || null
    }

    const { data, error } = await supabase
      .from("client_time_entries")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Time entry not found" }, { status: 404 })
      }
      console.error("Error updating time entry:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in PUT /api/time-entries/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Delete a time entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { error } = await supabase.from("client_time_entries").delete().eq("id", id)

    if (error) {
      console.error("Error deleting time entry:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/time-entries/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

