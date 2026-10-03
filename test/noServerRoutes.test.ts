import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(__dirname, '..');

describe('no unauthenticated proxy in the admin app', () => {
  it('has no route under src/app/api', () => {
    expect(existsSync(path.join(root, 'src/app/api'))).toBe(false);
  });

  it('has no direct treasury rewrite in next.config.ts', () => {
    const config = readFileSync(path.join(root, 'next.config.ts'), 'utf8');
    expect(config).not.toContain('/v1/treasury/:path');
    expect(config).not.toContain('8089');
    expect(config).not.toContain('TREASURY_GATEWAY_URL');
  });

  it('keeps the svc-gateway rewrite for every other /v1 request', () => {
    const config = readFileSync(path.join(root, 'next.config.ts'), 'utf8');
    expect(config).toContain("source: '/v1/:path*'");
  });
});
