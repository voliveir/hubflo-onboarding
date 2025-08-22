import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function PATCH(req: Request) {
  const { clientId, updates } = await req.json()
  console.log('Direct API received request:', { clientId, updates });
  
  if (!clientId || !updates || typeof updates !== 'object') {
    return NextResponse.json({ success: false, error: "Missing clientId or updates object" }, { status: 400 })
  }

  try {
    console.log('Using Supabase client for direct update');



    // Prepare update object for Supabase
    const updateData: any = {};
    
    if (updates.white_label_client_approval_status) {
      updateData.white_label_client_approval_status = updates.white_label_client_approval_status;
    }

    if (updates.white_label_client_approval_at) {
      updateData.white_label_client_approval_at = updates.white_label_client_approval_at;
    }

    if (updates.white_label_approval_feedback) {
      updateData.white_label_approval_feedback = updates.white_label_approval_feedback;
    }

    if (updates.white_label_approval_feedback_at) {
      updateData.white_label_approval_feedback_at = updates.white_label_approval_feedback_at;
    }

    if (updates.white_label_implementation_manager_notified_at) {
      updateData.white_label_implementation_manager_notified_at = updates.white_label_implementation_manager_notified_at;
    }

    updateData.updated_at = new Date().toISOString();

    console.log('Supabase update data:', updateData);

    const { data, error } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', clientId)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
    
    console.log('Supabase update successful:', data);
    return NextResponse.json({ success: true, data })

  } catch (error: any) {
    console.error('Supabase update error:', error);
    return NextResponse.json({ success: false, error: error?.message || "Unknown error" }, { status: 500 })
  }
}
