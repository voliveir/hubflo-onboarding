import { NextRequest, NextResponse } from "next/server"
import { incrementProjectTrackingByCategory } from "@/lib/database"

const VALID_CATEGORIES = ["call", "form", "smartdoc", "automation_integration"] as const

/** POST /api/clients/[id]/increment-tracking - Add to project tracking (quick actions) */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clientId } = await params
    const body = await request.json().catch(() => ({}))
    const { category, count = 1, callDate } = body

    if (!clientId || !category || !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: "Valid category required (call, form, smartdoc, automation_integration)" },
        { status: 400 }
      )
    }

    const safeCount = Math.max(1, Math.min(99, typeof count === "number" ? count : 1))
    const options = category === "call" && typeof callDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(callDate)
      ? { callDate }
      : undefined
    const result = await incrementProjectTrackingByCategory(clientId, category, safeCount, options)

    if (!result) {
      return NextResponse.json({ error: "Client not found or invalid" }, { status: 404 })
    }

    return NextResponse.json({ success: true, client: result })
  } catch (error) {
    console.error("Error incrementing tracking:", error)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}
