import { expect, vi } from 'vitest';
import { AdminApiError } from '../../src/services/adminApiError';
import { STORAGE_KEYS } from '../../src/lib/constants/storage';

export const GRPC_CODE_PERMISSION_DENIED = 7;
export const GRPC_CODE_NOT_FOUND = 5;
export const REASON_ADMIN_ROUTES_DISABLED = 'admin_routes_disabled';
export const REASON_NOT_FOUND = 'route_not_found';

export interface StorageOperations {
  readonly reads: string[];
  readonly writes: string[];
  readonly removals: string[];
}

/**
 * Installs a recording `window.localStorage`. The access-token key is read by `adminFetch`
 * itself (WP-8.4 owns it); every other key access is a data-persistence access.
 */
export function stubBrowserStorage(): StorageOperations {
  const ops: StorageOperations = { reads: [], writes: [], removals: [] };
  const storage = {
    getItem: (key: string) => {
      ops.reads.push(key);
      return null;
    },
    setItem: (key: string) => {
      ops.writes.push(key);
    },
    removeItem: (key: string) => {
      ops.removals.push(key);
    },
    clear: () => {
      ops.removals.push('*');
    },
    length: 0,
    key: () => null,
  };
  vi.stubGlobal('localStorage', storage);
  vi.stubGlobal('window', {
    localStorage: storage,
    location: { origin: 'http://localhost:3002', pathname: '/', href: 'http://localhost:3002/' },
  });
  return ops;
}

/** Stubs `fetch` so that every request answers with a grpc-gateway error body. */
export function stubBackendError(status: number, grpcCode: number, reason: string) {
  const fetchMock = vi.fn(
    async () =>
      new Response(JSON.stringify({ code: grpcCode, message: reason }), {
        status,
        headers: { 'Content-Type': 'application/json' },
      }),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

/** Stubs `fetch` so that every request fails at the network level. */
export function stubNetworkFailure(error: Error) {
  const fetchMock = vi.fn(async () => {
    throw error;
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

export async function expectAdminRejection(
  promise: Promise<unknown>,
  status: number,
  reason: string,
): Promise<void> {
  const error = await promise.then(
    () => {
      throw new Error('expected the call to reject, but it resolved');
    },
    (e: unknown) => e,
  );
  expect(error).toBeInstanceOf(AdminApiError);
  expect((error as AdminApiError).status).toBe(status);
  expect((error as AdminApiError).reason).toBe(reason);
}

/** No data key may be read or written; only the access-token key read by `adminFetch` is allowed. */
export function expectNoDataStorageAccess(ops: StorageOperations): void {
  expect(ops.writes).toEqual([]);
  expect(ops.removals).toEqual([]);
  expect(ops.reads.filter((key) => key !== STORAGE_KEYS.ADMIN_ACCESS_TOKEN)).toEqual([]);
}
