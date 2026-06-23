describe('brain', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.BRAIN_DB_PATH = `${process.cwd()}/test-${Math.random()}.db`;
  });

  afterEach(() => {
    const p = process.env.BRAIN_DB_PATH as string;
    if (require('fs').existsSync(p)) {
      require('fs').unlinkSync(p);
    }
  });

  it('stores and retrieves embeddings', async () => {
    const { storeEmbedding, searchEmbedding } = await import('../brain');
    await storeEmbedding('hello world', { userId: '1', timestamp: 't1' });
    await storeEmbedding('goodbye world', { userId: '2', timestamp: 't2' });
    const results = await searchEmbedding('hello', 1);
    expect(results[0].text).toBe('hello world');
    expect(results[0].metadata.userId).toBe('1');
  });

  it('returns empty array when no embeddings', async () => {
    const { searchEmbedding } = await import('../brain');
    const results = await searchEmbedding('none', 5);
    expect(results).toEqual([]);
  });

  it('returns empty array when k is 0', async () => {
    const { searchEmbedding } = await import('../brain');
    const results = await searchEmbedding('hello', 0);
    expect(results).toEqual([]);
  });

  it('returns empty array when k is negative', async () => {
    const { searchEmbedding } = await import('../brain');
    const results = await searchEmbedding('hello', -3);
    expect(results).toEqual([]);
  });

  it('limits results to k', async () => {
    const { storeEmbedding, searchEmbedding } = await import('../brain');
    await storeEmbedding('a', {});
    await storeEmbedding('b', {});
    const results = await searchEmbedding('a', 1);
    expect(results.length).toBe(1);
    expect(results[0].text).toBe('a');
    if (results[0].similarity !== undefined) {
      expect(results[0].similarity).toBeGreaterThanOrEqual(0.99);
    }
  });
});
