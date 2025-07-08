import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/database';

const API_KEY = process.env.CLIENT_CREATION_API_KEY;

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key');
  const serverKey = process.env.CLIENT_CREATION_API_KEY;
  console.log('Received x-api-key:', apiKey);
  console.log('Server API_KEY:', serverKey);
  if (!serverKey || apiKey !== serverKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.name || !body.email) {
      return NextResponse.json({ error: 'Missing required fields: name, email' }, { status: 400 });
    }
    const slug = body.slug || generateSlug(body.name);
    const clientData = { ...body, slug };
    const client = await createClient(clientData);
    if (!client) {
      return NextResponse.json({ error: 'Failed to create client' }, { status: 400 });
    }
    const portalUrl = `/client/${client.slug}`;
    return NextResponse.json({ portalUrl, client }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Unknown error' }, { status: 400 });
  }
} 