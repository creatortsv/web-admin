import { describe, it, expect } from 'vitest';
import { computeAuditHash, verifyAuditChain } from '../src/lib/auditHasher';

describe('Audit Log SHA-256 Hash Chaining', () => {
  it('computes deterministic hashes and validates an untampered chain', () => {
    const genesis = {
      prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
      timestamp: '2026-09-02T12:00:00Z',
      actorEmail: 'super-admin@venom.finance',
      action: 'BOOTSTRAP_SUPERADMIN',
      target: 'SYSTEM',
    };
    const genesisHash = computeAuditHash(genesis);
    const block0 = { ...genesis, currentHash: genesisHash };

    const event1 = {
      prevHash: genesisHash,
      timestamp: '2026-09-02T12:05:00Z',
      actorEmail: 'super-admin@venom.finance',
      action: 'UPDATE_TREASURY_ADDRESS',
      target: 'TRON_USDT_VAULT',
    };
    const event1Hash = computeAuditHash(event1);
    const block1 = { ...event1, currentHash: event1Hash };

    expect(verifyAuditChain([block0, block1])).toBe(true);
  });

  it('detects tampering when payload or previous hash is modified', () => {
    const genesis = {
      prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
      timestamp: '2026-09-02T12:00:00Z',
      actorEmail: 'super-admin@venom.finance',
      action: 'BOOTSTRAP_SUPERADMIN',
      target: 'SYSTEM',
    };
    const block0 = { ...genesis, currentHash: computeAuditHash(genesis) };

    const event1 = {
      prevHash: block0.currentHash,
      timestamp: '2026-09-02T12:05:00Z',
      actorEmail: 'attacker@bad.actor', // Tampered actor!
      action: 'UPDATE_TREASURY_ADDRESS',
      target: 'TRON_USDT_VAULT',
      currentHash: 'fake_hash',
    };

    expect(verifyAuditChain([block0, event1])).toBe(false);
  });
});
