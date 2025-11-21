import { NextRequest, NextResponse } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables")
}

const supabase = createSupabaseClient(supabaseUrl, supabaseKey)

// GET - Get time summary for clients (optionally filtered by client_id)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get("client_id")

    let query = supabase.rpc("get_client_total_time", { client_uuid: clientId || null })

    if (clientId) {
      const { data, error } = await supabase.rpc("get_client_total_time", {
        client_uuid: clientId,
      })

      if (error) {
        // Fallback to manual calculation if function doesn't exist
        const { data: entries, error: entriesError } = await supabase
          .from("client_time_entries")
          .select("entry_type, duration_minutes")
          .eq("client_id", clientId)

        if (entriesError) {
          console.error("Error fetching time entries:", entriesError)
          return NextResponse.json({ error: entriesError.message }, { status: 500 })
        }

        const summary = {
          total_minutes: entries.reduce((sum, e) => sum + e.duration_minutes, 0),
          total_hours: entries.reduce((sum, e) => sum + e.duration_minutes, 0) / 60.0,
          meeting_minutes: entries
            .filter((e) => e.entry_type === "meeting")
            .reduce((sum, e) => sum + e.duration_minutes, 0),
          email_minutes: entries
            .filter((e) => e.entry_type === "email")
            .reduce((sum, e) => sum + e.duration_minutes, 0),
          implementation_minutes: entries
            .filter((e) => e.entry_type === "implementation")
            .reduce((sum, e) => sum + e.duration_minutes, 0),
        }

        return NextResponse.json(summary)
      }

      return NextResponse.json(data?.[0] || { total_minutes: 0, total_hours: 0, meeting_minutes: 0, email_minutes: 0, implementation_minutes: 0 })
    }

    // Get summary for all clients
    const { data: entries, error: entriesError } = await supabase
      .from("client_time_entries")
      .select("client_id, entry_type, duration_minutes, client:clients(id, name, revenue_amount, success_package)")

    if (entriesError) {
      console.error("Error fetching time entries:", entriesError)
      return NextResponse.json({ error: entriesError.message }, { status: 500 })
    }

    // Group by client_id
    const clientSummaries: Record<
      string,
      {
        total_minutes: number
        total_hours: number
        meeting_minutes: number
        email_minutes: number
        implementation_minutes: number
        client_name?: string
        client_acv?: number
        client_package?: string
      }
    > = {}

    entries.forEach((entry: any) => {
      const clientId = entry.client_id
      if (!clientSummaries[clientId]) {
        clientSummaries[clientId] = {
          total_minutes: 0,
          total_hours: 0,
          meeting_minutes: 0,
          email_minutes: 0,
          implementation_minutes: 0,
          client_name: entry.client?.name,
          client_acv: entry.client?.revenue_amount,
          client_package: entry.client?.success_package,
        }
      }

      clientSummaries[clientId].total_minutes += entry.duration_minutes
      clientSummaries[clientId].total_hours =
        clientSummaries[clientId].total_minutes / 60.0

      if (entry.entry_type === "meeting") {
        clientSummaries[clientId].meeting_minutes += entry.duration_minutes
      } else if (entry.entry_type === "email") {
        clientSummaries[clientId].email_minutes += entry.duration_minutes
      } else if (entry.entry_type === "implementation") {
        clientSummaries[clientId].implementation_minutes += entry.duration_minutes
      }
    })

    return NextResponse.json(Object.entries(clientSummaries).map(([client_id, summary]) => ({ client_id, ...summary })))
  } catch (error) {
    console.error("Error in GET /api/time-entries/summary:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

