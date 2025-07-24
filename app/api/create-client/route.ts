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
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const portalUrl = `${baseUrl}/client/${client.slug}`;

    // Send data to Zapier webhook
    try {
      await fetch('https://hooks.zapier.com/hooks/catch/11430058/uu5eofg/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: client.name,
          slug: client.slug,
          email: client.email,
          portalUrl,
        }),
      });
    } catch (zapierError) {
      // Optionally log the error, but do not block client creation
      console.error('Failed to notify Zapier webhook:', zapierError);
    }

    return NextResponse.json({ portalUrl, client }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Unknown error' }, { status: 400 });
  }
} 