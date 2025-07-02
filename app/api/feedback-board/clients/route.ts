import { NextRequest, NextResponse } from 'next/server';
import { getAllClients } from '@/lib/database';

export async function GET(req: NextRequest) {
  try {
    const clients = await getAllClients();
    // Only return id and name
    return NextResponse.json(clients.map(c => ({ id: c.id, name: c.name })));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
} 