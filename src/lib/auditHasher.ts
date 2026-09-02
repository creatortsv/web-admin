import crypto from 'crypto';

export interface HashableAuditEntry {
  prevHash: string;
  timestamp: string;
  actorEmail: string;
  action: string;
  target: string;
}

export function computeAuditHash(entry: HashableAuditEntry): string {
  const payload = `${entry.prevHash}|${entry.timestamp}|${entry.actorEmail}|${entry.action}|${entry.target}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
}

export function verifyAuditChain(chain: { prevHash: string; currentHash: string; timestamp: string; actorEmail: string; action: string; target: string }[]): boolean {
  for (let i = 0; i < chain.length; i++) {
    const expectedHash = computeAuditHash(chain[i]);
    if (expectedHash !== chain[i].currentHash) {
      return false; // Tampered block!
    }
    if (i > 0 && chain[i].prevHash !== chain[i - 1].currentHash) {
      return false; // Broken link!
    }
  }
  return true;
}
