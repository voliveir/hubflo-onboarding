import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/database';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  if (!email) {
    return NextResponse.json({ error: 'Missing email parameter' }, { status: 400 });
  }
  // Find client by email
  const client = await getClientByEmail(email);
  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const portalUrl = `${baseUrl}/client/${client.slug}`;
  return NextResponse.json({ ...client, portalUrl });
}

// Helper to find client by email
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Client } from '@/lib/types';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

async function getClientByEmail(email: string): Promise<Client | null> {
  const { data, error } = await supabase.from('clients').select('*').ilike('email', email).single();
  if (error || !data) return null;
  // Optionally, use transformClientFromDb if needed
  return data as Client;
} 