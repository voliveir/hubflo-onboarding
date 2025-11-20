import { NextRequest, NextResponse } from "next/server"
import { getAllClients } from "@/lib/database"

export async function GET(req: NextRequest) {
  try {
    const clients = await getAllClients()
    // Return clients with id, name, and revenue_amount for time tracking
    return NextResponse.json(
      clients
        .filter((c) => !c.is_demo)
        .map((c) => ({
          id: c.id,
          name: c.name,
          revenue_amount: c.revenue_amount,
        }))
    )
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

