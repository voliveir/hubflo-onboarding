import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function PATCH(req: Request) {
  const { clientId, updates } = await req.json()
  
  if (!clientId || !updates || typeof updates !== 'object') {
    return NextResponse.json({ success: false, error: "Missing clientId or updates object" }, { status: 400 })
  }

  try {
    // Prepare update object - allow all client fields to be updated
    const updateData: any = { ...updates }
    
    // Always update the updated_at timestamp
    updateData.updated_at = new Date().toISOString()

    // Handle white label approval requested timestamp
    if (updates.white_label_status === "waiting_for_approval" && !updates.white_label_approval_requested_at) {
      updateData.white_label_approval_requested_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', clientId)
      .select()
      .single()
    
    if (error) {
      console.error('Supabase update error:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ success: false, error: error?.message || "Unknown error" }, { status: 500 })
  }
}

