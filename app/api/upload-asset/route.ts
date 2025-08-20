import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const clientId = formData.get('clientId') as string;
    
    if (!file || !clientId) {
      return NextResponse.json(
        { error: 'File and clientId are required' },
        { status: 400 }
      );
    }

    const filePath = `${clientId}/${Date.now()}-${file.name}`;
    
    // First, let's check the bucket configuration
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();
    console.log('Available buckets:', buckets);
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
    }
    
    // Upload the file using the admin client
    const { error: uploadError } = await supabaseAdmin.storage
      .from('white-label-assets')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get the public URL using the admin client
    const { data: urlData } = supabaseAdmin.storage
      .from('white-label-assets')
      .getPublicUrl(filePath);

    if (!urlData || !urlData.publicUrl) {
      return NextResponse.json(
        { error: 'Failed to get public URL' },
        { status: 500 }
      );
    }

    console.log('Upload successful:', {
      filePath,
      publicUrl: urlData.publicUrl
    });

    return NextResponse.json({
      success: true,
      publicUrl: urlData.publicUrl,
      filePath
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
