/** @jest-environment node */
import { POST as detectLoop } from './detect-loop/route';

describe('API authentication', () => {
  it('rejects requests without valid token', async () => {
    const req = new Request('http://example.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'test' }),
    });
    const res = await detectLoop(req as any);
    expect(res.status).toBe(401);
  });
});
