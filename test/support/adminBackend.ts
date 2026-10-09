import { expect, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Skeleton } from '@creatortsv/pkg-ui';
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

/** The first class of the pkg-ui `Skeleton`, the marker of a loading frame (as `pagesInitialState.test.tsx`). */
export const SKELETON_CLASS: string = /class="([^"]+)"/.exec(renderToStaticMarkup(createElement(Skeleton)))![1].split(' ')[0];

/** A grpc-gateway answer of a stubbed route. */
export interface StubbedAnswer {
  readonly status: number;
  readonly body: unknown;
}

/** The answer of the admin backend while its routes are disabled: `403 {"code":7,"message":"admin_routes_disabled"}`. */
export const ANSWER_ADMIN_ROUTES_DISABLED: StubbedAnswer = {
  status: 403,
  body: { code: GRPC_CODE_PERMISSION_DENIED, message: REASON_ADMIN_ROUTES_DISABLED },
};

/** Stubs `fetch` with a request that is never answered (the loading state). */
export function stubBackendNeverAnswers() {
  const fetchMock = vi.fn(() => new Promise<Response>(() => undefined));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

/**
 * Stubs `fetch` with one answer per route. A route key is the method and the URL exactly as the page
 * requests it, for example `'GET /v1/admin/stats'`; a route that is not listed answers 404
 * `route_not_found`, so a page that calls an unexpected URL fails loudly.
 */
export function stubBackendRoutes(routes: Record<string, StubbedAnswer>) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const answer = routes[`${init?.method ?? 'GET'} ${String(input)}`] ?? {
      status: 404,
      body: { code: GRPC_CODE_NOT_FOUND, message: REASON_NOT_FOUND },
    };
    return new Response(JSON.stringify(answer.body), {
      status: answer.status,
      headers: { 'Content-Type': 'application/json' },
    });
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

/** `venom.billing.v1` gateway list entry and configuration as grpc-gateway writes them. */
export const universalGatewayWire = {
  name: 'stripe',
  displayName: 'Stripe',
  type: 'card',
  isEnabled: true,
  environment: 'TEST',
};

export const universalGatewayConfigWire = {
  gatewayName: 'stripe',
  displayName: 'Stripe',
  type: 'card',
  isEnabled: true,
  environment: 'TEST',
  version: 3,
  status: 'CONFIGURED',
  isSealed: true,
  maskedSecretKey: 'sk_test_***1234',
  maskedWebhookSecret: 'whsec_***5678',
  planPriceMappings: { STARTER: 'price_starter', PRO: 'price_pro', ENTERPRISE: 'price_enterprise' },
  webhookUrl: '/v1/billing/webhooks/stripe',
};
