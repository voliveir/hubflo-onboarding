import { NextRequest, NextResponse } from "next/server"
import { updateClient } from "@/lib/database"

/** PATCH /api/clients/[id]/churn-status - Set churned or churn_risk */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clientId } = await params
    const body = await request.json().catch(() => ({}))
    const { churned, churn_risk } = body

    if (!clientId) {
      return NextResponse.json({ error: "Client ID required" }, { status: 400 })
    }

    const updates: { churned?: boolean; churn_risk?: boolean } = {}

    if (typeof churned === "boolean") {
      updates.churned = churned
      // When marking as churned, clear churn_risk
      if (churned) updates.churn_risk = false
    }
    if (typeof churn_risk === "boolean") {
      updates.churn_risk = churn_risk
      // When marking as churn risk, clear churned
      if (churn_risk) updates.churned = false
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "churned or churn_risk required" }, { status: 400 })
    }

    const result = await updateClient(clientId, updates)

    if (!result) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, client: result })
  } catch (error) {
    console.error("Error updating churn status:", error)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}
