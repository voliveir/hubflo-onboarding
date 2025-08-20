import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request: NextRequest) {
  try {
    // List all buckets
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();
    console.log('All buckets:', buckets);
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      return NextResponse.json({ error: bucketsError.message }, { status: 500 });
    }
    
    // Check if white-label-assets bucket exists
    const whiteLabelBucket = buckets?.find(bucket => bucket.name === 'white-label-assets');
    console.log('White label bucket:', whiteLabelBucket);
    
    // List files in the bucket root
    const { data: files, error: filesError } = await supabaseAdmin.storage
      .from('white-label-assets')
      .list();
    
    console.log('Files in bucket root:', files);
    
    if (filesError) {
      console.error('Error listing files:', filesError);
    }
    
    // List files in the first client directory
    let clientFiles: any[] = [];
    if (files && files.length > 0) {
      const { data: clientDirFiles, error: clientDirError } = await supabaseAdmin.storage
        .from('white-label-assets')
        .list(files[0].name);
      
      console.log('Files in client directory:', clientDirFiles);
      clientFiles = clientDirFiles || [];
      
      if (clientDirError) {
        console.error('Error listing client directory files:', clientDirError);
      }
    }
    
    return NextResponse.json({
      buckets: buckets,
      whiteLabelBucket: whiteLabelBucket,
      rootFiles: files,
      clientFiles: clientFiles,
      bucketError: bucketsError?.message,
      filesError: filesError?.message
    });
    
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
