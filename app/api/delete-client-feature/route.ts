import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase" // Use your admin client if available

export async function DELETE(req: Request) {
  const { clientFeatureId } = await req.json()
  try {
    const { error } = await supabase.from("client_features").delete().eq("id", clientFeatureId)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Unknown error" }, { status: 500 })
  }
} 