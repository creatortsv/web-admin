import { describe, it, expect } from 'vitest';
import { readRepositoryFile } from './support/sourceAst';

/**
 * ai/docs/architecture.md describes the routing as the code implements it: every `/v1/*` request,
 * `/v1/treasury/*` included, reaches svc-gateway. The direct svc-treasury rewrite was removed.
 * [Policy Ref: Contract §2.5 - no open server proxies; Contract §1.6 - documentation in the same PR]
 */
describe('ai/docs/architecture.md routing', () => {
  const document = readRepositoryFile('ai/docs/architecture.md');

  it('does not describe the removed svc-treasury rewrite', () => {
    expect(document).not.toContain('TREASURY_GATEWAY_URL');
    expect(document).not.toContain('8089');
  });

  it('describes the single svc-gateway rewrite', () => {
    expect(document).toContain('/v1/:path*');
    expect(document).toContain('API_GATEWAY_URL');
    expect(document).toMatch(/svc-gateway/);
  });

  it('states that no server route forwards a request', () => {
    expect(document).toMatch(/src\/app\/api/);
  });
});
