import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { client_id, client_email, task_id, completed_at, task_name } = body;
    if (!client_id && !client_email) {
      return NextResponse.json({ error: 'Missing client_id or client_email' }, { status: 400 });
    }
    if (!task_id || !completed_at) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // If client_id is not provided, look it up by email
    if (!client_id && client_email) {
      const { data: client, error: clientError } = await supabaseAdmin
        .from('clients')
        .select('id')
        .eq('email', client_email)
        .single();
      if (clientError || !client) {
        return NextResponse.json({ error: 'Client not found for provided email' }, { status: 404 });
      }
      client_id = client.id;
    }

    // Upsert the task completion
    const { error } = await supabaseAdmin.from('task_completions').upsert({
      client_id,
      task_id,
      is_completed: true,
      completed_at,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'client_id,task_id' });

    if (error) {
      console.error('Supabase upsert error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'This endpoint only accepts POST requests.' }, { status: 405 });
} 