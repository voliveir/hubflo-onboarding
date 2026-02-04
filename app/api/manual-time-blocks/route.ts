import { NextRequest, NextResponse } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables")
}

const supabase = createSupabaseClient(supabaseUrl, supabaseKey)

// GET - Fetch manual time blocks for a date range
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("start_date")
    const endDate = searchParams.get("end_date")

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing start_date and end_date (ISO strings)" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("manual_time_blocks")
      .select("*")
      .lte("started_at", endDate)
      .gte("ended_at", startDate)
      .order("started_at", { ascending: true })

    if (error) {
      console.error("Error fetching manual time blocks:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Error in GET /api/manual-time-blocks:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create a manual time block (e.g. lunch)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { started_at, ended_at, category = "lunch", label } = body

    if (!started_at || !ended_at) {
      return NextResponse.json(
        { error: "started_at and ended_at (ISO strings) are required" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("manual_time_blocks")
      .insert({ started_at, ended_at, category: category || "lunch", label: label || null })
      .select()
      .single()

    if (error) {
      console.error("Error creating manual time block:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in POST /api/manual-time-blocks:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
