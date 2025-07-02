import { NextRequest, NextResponse } from 'next/server';
import {
  getFeedbackBoardCards,
  createFeedbackBoardCard,
  updateFeedbackBoardCard,
  deleteFeedbackBoardCard,
  getAllClients,
} from '@/lib/database';

export async function GET(req: NextRequest) {
  const { searchParams, pathname } = new URL(req.url);
  // Support /api/feedback-board/clients
  if (pathname.endsWith('/clients')) {
    try {
      const clients = await getAllClients();
      // Only return id and name
      return NextResponse.json(clients.map(c => ({ id: c.id, name: c.name })));
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
  }
  const clientId = searchParams.get('clientId') || undefined;
  const status = searchParams.get('status') || undefined;
  try {
    const cards = await getFeedbackBoardCards({ clientId, status });
    return NextResponse.json(cards);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const card = await createFeedbackBoardCard(body);
    return NextResponse.json(card, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json();
    const card = await updateFeedbackBoardCard(id, updates);
    return NextResponse.json(card);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await deleteFeedbackBoardCard(id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
} 