// Pure Universal SHA-256 (FIPS 180-4) with zero external dependencies and zero Node.js polyfill bloat.
const K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

function sha256(str: string): string {
  const rotr = (n: number, x: number) => (x >>> n) | (x << (32 - n));
  const Sigma0 = (x: number) => rotr(2, x) ^ rotr(13, x) ^ rotr(22, x);
  const Sigma1 = (x: number) => rotr(6, x) ^ rotr(11, x) ^ rotr(25, x);
  const sigma0 = (x: number) => rotr(7, x) ^ rotr(18, x) ^ (x >>> 3);
  const sigma1 = (x: number) => rotr(17, x) ^ rotr(19, x) ^ (x >>> 10);
  const Ch = (x: number, y: number, z: number) => (x & y) ^ (~x & z);
  const Maj = (x: number, y: number, z: number) => (x & y) ^ (x & z) ^ (y & z);

  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);

  const bitLen = bytes.length * 8;
  const newLen = Math.ceil((bytes.length + 9) / 64) * 64;
  const padded = new Uint8Array(newLen);
  padded.set(bytes);
  padded[bytes.length] = 0x80;

  const view = new DataView(padded.buffer);
  view.setUint32(newLen - 4, bitLen, false);

  let H0 = 0x6a09e667,
    H1 = 0xbb67ae85,
    H2 = 0x3c6ef372,
    H3 = 0xa54ff53a;
  let H4 = 0x510e527f,
    H5 = 0x9b05688c,
    H6 = 0x1f83d9ab,
    H7 = 0x5be0cd19;

  const W = new Uint32Array(64);

  for (let i = 0; i < newLen; i += 64) {
    for (let t = 0; t < 16; t++) {
      W[t] = view.getUint32(i + t * 4, false);
    }
    for (let t = 16; t < 64; t++) {
      W[t] = (sigma1(W[t - 2]) + W[t - 7] + sigma0(W[t - 15]) + W[t - 16]) | 0;
    }

    let a = H0,
      b = H1,
      c = H2,
      d = H3,
      e = H4,
      f = H5,
      g = H6,
      h = H7;

    for (let t = 0; t < 64; t++) {
      const T1 = (h + Sigma1(e) + Ch(e, f, g) + K[t] + W[t]) | 0;
      const T2 = (Sigma0(a) + Maj(a, b, c)) | 0;
      h = g;
      g = f;
      f = e;
      e = (d + T1) | 0;
      d = c;
      c = b;
      b = a;
      a = (T1 + T2) | 0;
    }

    H0 = (H0 + a) | 0;
    H1 = (H1 + b) | 0;
    H2 = (H2 + c) | 0;
    H3 = (H3 + d) | 0;
    H4 = (H4 + e) | 0;
    H5 = (H5 + f) | 0;
    H6 = (H6 + g) | 0;
    H7 = (H7 + h) | 0;
  }

  const out = new DataView(new ArrayBuffer(32));
  out.setUint32(0, H0, false);
  out.setUint32(4, H1, false);
  out.setUint32(8, H2, false);
  out.setUint32(12, H3, false);
  out.setUint32(16, H4, false);
  out.setUint32(20, H5, false);
  out.setUint32(24, H6, false);
  out.setUint32(28, H7, false);

  let hex = '';
  for (let i = 0; i < 32; i++) {
    hex += out.getUint8(i).toString(16).padStart(2, '0');
  }
  return hex;
}

export interface HashableAuditEntry {
  prevHash: string;
  timestamp: string;
  actorEmail: string;
  action: string;
  target: string;
}

export function computeAuditHash(entry: HashableAuditEntry): string {
  const payload = `${entry.prevHash}|${entry.timestamp}|${entry.actorEmail}|${entry.action}|${entry.target}`;
  return sha256(payload);
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
