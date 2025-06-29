import { NextResponse } from "next/server"
import { updateClientFeature } from "@/lib/database"

export async function PATCH(req: Request) {
  const { clientFeatureId, updates } = await req.json()
  try {
    await updateClientFeature(clientFeatureId, updates)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Unknown error" }, { status: 500 })
  }
} 