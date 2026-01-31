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
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

// OPTIONS - CORS preflight (required for Chrome extension POST)
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

// GET - Fetch browser activity for a given date (for Activity Timeline page)
// Supports: date (YYYY-MM-DD) or start_date + end_date (ISO strings) for correct timezone
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get("date")
    const startDate = searchParams.get("start_date")
    const endDate = searchParams.get("end_date")
    const includeHidden = searchParams.get("include_hidden") === "true"

    let startOfDay: string
    let endOfDay: string

    if (startDate && endDate) {
      startOfDay = startDate
      endOfDay = endDate
    } else if (date) {
      startOfDay = `${date}T00:00:00.000Z`
      endOfDay = `${date}T23:59:59.999Z`
    } else {
      return NextResponse.json(
        { error: "Missing required parameter: date (YYYY-MM-DD) or start_date and end_date (ISO)" },
        { status: 400, headers: corsHeaders }
      )
    }

    let query = supabase
      .from("browser_activity")
      .select("*")
      .lte("started_at", endOfDay)
      .gte("ended_at", startOfDay)
      .order("started_at", { ascending: true })

    if (!includeHidden) {
      query = query.or("is_hidden.is.null,is_hidden.eq.false")
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching browser activity:", error)
      return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })
    }

    return NextResponse.json(data || [], { headers: corsHeaders })
  } catch (error) {
    console.error("Error in GET /api/browser-activity:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders })
  }
}

// POST - Create browser activity (called by Chrome extension)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, domain, page_title, started_at, ended_at, duration_seconds, client_id } = body

    if (!url || !started_at || !ended_at || duration_seconds === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: url, started_at, ended_at, duration_seconds" },
        { status: 400, headers: corsHeaders }
      )
    }

    if (duration_seconds < 0) {
      return NextResponse.json(
        { error: "duration_seconds must be >= 0" },
        { status: 400, headers: corsHeaders }
      )
    }

    const { data, error } = await supabase
      .from("browser_activity")
      .insert([
        {
          url,
          domain: domain || null,
          page_title: page_title || null,
          started_at,
          ended_at,
          duration_seconds,
          client_id: client_id || null,
          source: "chrome_extension",
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating browser activity:", error)
      return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })
    }

    return NextResponse.json(data, { status: 201, headers: corsHeaders })
  } catch (error) {
    console.error("Error in POST /api/browser-activity:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders })
  }
}
