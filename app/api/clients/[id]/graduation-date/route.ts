import { NextRequest, NextResponse } from "next/server"
import { updateClient } from "@/lib/database"

/** PATCH /api/clients/[id]/graduation-date - Set or clear graduation date */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clientId } = await params
    const body = await request.json().catch(() => ({}))
    const { graduation_date } = body

    if (!clientId) {
      return NextResponse.json({ error: "Client ID required" }, { status: 400 })
    }

    const value = graduation_date === null || graduation_date === ""
      ? null
      : typeof graduation_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(graduation_date)
        ? graduation_date
        : undefined

    if (value === undefined && graduation_date !== null && graduation_date !== "") {
      return NextResponse.json(
        { error: "graduation_date must be YYYY-MM-DD or null" },
        { status: 400 }
      )
    }

    const result = await updateClient(clientId, { graduation_date: value })

    if (!result) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, client: result })
  } catch (error) {
    console.error("Error updating graduation date:", error)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}
