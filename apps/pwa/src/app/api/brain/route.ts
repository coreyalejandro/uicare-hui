import { NextRequest, NextResponse } from 'next/server';
import { storeEmbedding, searchEmbedding } from '@/lib/brain';

export async function POST(req: NextRequest) {
  const { text, metadata } = await req.json();
// Validate 'text'
if (typeof text !== 'string' || text.trim().length === 0) {
    return NextResponse.json(
        { error: "'text' must be a non-empty string." },
        { status: 400 }
    );
}

// Validate 'metadata'
if (metadata !== undefined && (typeof metadata !== 'object' || metadata === null || Array.isArray(metadata))) {
    return NextResponse.json(
        { error: "'metadata' must be an object if provided." },
        { status: 400 }
    );
}
  await storeEmbedding(text, metadata || {});
  return NextResponse.json({ status: 'ok' });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const k = parseInt(searchParams.get('k') || '5', 10);
  const results = await searchEmbedding(q, k);
  return NextResponse.json(results);
}
