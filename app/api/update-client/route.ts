import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function PATCH(req: Request) {
  const { clientId, updates } = await req.json()
  console.log('API received request (RPC path):', { clientId, updates });
  
  if (!clientId || !updates || typeof updates !== 'object') {
    return NextResponse.json({ success: false, error: "Missing clientId or updates object" }, { status: 400 })
  }

  try {
    const { error } = await supabaseAdmin.rpc('update_client_approval', {
      p_client_id: clientId,
      p_status: updates.white_label_client_approval_status ?? null,
      p_approval_at: updates.white_label_client_approval_at ?? null,
      p_feedback: updates.white_label_approval_feedback ?? null,
      p_feedback_at: updates.white_label_approval_feedback_at ?? null,
      p_im_notified_at: updates.white_label_implementation_manager_notified_at ?? null,
    })

    if (error) {
      console.error('RPC error:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ success: false, error: error?.message || "Unknown error" }, { status: 500 })
  }
}
