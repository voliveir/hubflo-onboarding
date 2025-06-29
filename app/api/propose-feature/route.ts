import { NextResponse } from "next/server"
import { proposeFeatureToClient } from "@/lib/database"

export async function POST(req: Request) {
  const { clientId, featureId, salesPerson, customNotes } = await req.json()
  try {
    await proposeFeatureToClient(clientId, featureId, salesPerson, customNotes)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Unknown error" }, { status: 500 })
  }
} 