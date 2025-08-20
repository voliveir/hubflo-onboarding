import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const { clientId } = await request.json();
    
    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    // List files in the client's directory
    const { data: files, error: filesError } = await supabaseAdmin.storage
      .from('white-label-assets')
      .list(clientId);
    
    if (filesError) {
      console.error('Error listing files:', filesError);
      return NextResponse.json({ error: filesError.message }, { status: 500 });
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files found for this client' }, { status: 404 });
    }

    // Generate public URLs for all files
    const assetUrls = files.map(file => {
      const { data: urlData } = supabaseAdmin.storage
        .from('white-label-assets')
        .getPublicUrl(`${clientId}/${file.name}`);
      
      return urlData?.publicUrl;
    }).filter(Boolean);

    console.log('Generated URLs for client:', clientId, assetUrls);

    // Update the client record with the new URLs
    const { error: updateError } = await supabaseAdmin
      .from('clients')
      .update({ white_label_app_assets: assetUrls })
      .eq('id', clientId);

    if (updateError) {
      console.error('Error updating client:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      assetUrls: assetUrls,
      message: `Updated ${assetUrls.length} asset URLs for client ${clientId}`
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
