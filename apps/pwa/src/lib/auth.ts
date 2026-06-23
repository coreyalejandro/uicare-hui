import { NextResponse } from 'next/server';

/**
 * Simple bearer token authentication.
 * Expects `Authorization: Bearer <token>` header where token matches `AUTH_TOKEN` env var.
 */
export function requireAuth(req: Request): NextResponse | null {
  const expected = process.env.AUTH_TOKEN;
  const auth = req.headers.get('authorization');
  if (!expected || auth !== `Bearer ${expected}`) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return null;
}
