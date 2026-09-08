import { describe, it, expect } from 'vitest';
import { generateTraceparent } from '@/services/adminApi';

describe('adminApi distributed tracing', () => {
  it('generates valid W3C traceparent string', () => {
    const traceparent = generateTraceparent();
    expect(traceparent).toMatch(/^00-[0-9a-f]{32}-[0-9a-f]{16}-01$/);
  });
});
