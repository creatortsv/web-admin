import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useAdminAuthStore, parseJwtPayload, isTokenExpired } from '@/stores/useAdminAuthStore';
import { adminFetch } from '@/services/adminApi';
import { STORAGE_KEYS } from '@/lib/constants/storage';

// Helper to construct a mock base64url encoded JWT
function createMockJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'EdDSA', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = 'mock_signature_bytes';
  return `${header}.${body}.${signature}`;
}

describe('Admin Authentication Store & API Client (Issue #50)', () => {
  const originalFetch = global.fetch;
  const mockLocalStorage = new Map<string, string>();

  beforeEach(() => {
    mockLocalStorage.clear();

    // Setup mock localStorage in Node/Vitest environment
    const storageMock = {
      getItem: (key: string) => mockLocalStorage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        mockLocalStorage.set(key, value);
      },
      removeItem: (key: string) => {
        mockLocalStorage.delete(key);
      },
      clear: () => {
        mockLocalStorage.clear();
      },
      length: 0,
      key: () => null,
    };

    vi.stubGlobal('localStorage', storageMock);
    vi.stubGlobal('window', {
      localStorage: storageMock,
      location: {
        origin: 'http://localhost:3002',
        pathname: '/settings/broker-rebates',
        href: 'http://localhost:3002/settings/broker-rebates',
      },
    });

    useAdminAuthStore.getState().logout();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('JWT Utility Functions', () => {
    it('parses valid JWT payloads correctly', () => {
      const claims = {
        sub: 'usr_admin_123',
        email: 'security-admin@venom.finance',
        roles: ['super_admin'],
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      const token = createMockJwt(claims);
      const parsed = parseJwtPayload(token);

      expect(parsed).toBeDefined();
      expect(parsed?.sub).toBe('usr_admin_123');
      expect(parsed?.email).toBe('security-admin@venom.finance');
      expect(parsed?.roles).toEqual(['super_admin']);
    });

    it('returns null for malformed JWT strings', () => {
      expect(parseJwtPayload('')).toBeNull();
      expect(parseJwtPayload('invalid.token')).toBeNull();
      expect(parseJwtPayload('a.b.c.d')).toBeNull();
    });

    it('correctly detects expired JWTs', () => {
      const expiredToken = createMockJwt({
        sub: 'usr_expired',
        exp: Math.floor(Date.now() / 1000) - 60, // 1 minute ago
      });
      const validToken = createMockJwt({
        sub: 'usr_valid',
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      });

      expect(isTokenExpired(expiredToken)).toBe(true);
      expect(isTokenExpired(validToken)).toBe(false);
    });
  });

  describe('useAdminAuthStore - Production Invariants', () => {
    it('purges mock bypass: initializes in unauthenticated state when no token exists', () => {
      useAdminAuthStore.getState().logout();
      const state = useAdminAuthStore.getState();

      expect(state.isAuthenticated).toBe(false);
      expect(state.accessToken).toBeNull();
      expect(state.adminEmail).toBe('');
      expect(state.mfaVerified).toBe(false);
    });

    it('rejects login with invalid inputs without network calls', async () => {
      const fetchSpy = vi.fn();
      global.fetch = fetchSpy;

      const resEmpty = await useAdminAuthStore.getState().login('', '123456');
      expect(resEmpty).toBe(false);
      expect(fetchSpy).not.toHaveBeenCalled();

      const resShortCode = await useAdminAuthStore.getState().login('admin@venom.finance', '123');
      expect(resShortCode).toBe(false);
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('executes full 2-step admin login flow: /v1/auth/login and /v1/auth/totp/verify', async () => {
      const targetEmail = 'admin@venom.finance';
      const totpCode = '987654';
      const mfaToken = createMockJwt({ sub: 'mfa_temp_user', token_type: 'mfa' });
      const finalAccessToken = createMockJwt({
        sub: 'usr_super_admin',
        email: targetEmail,
        roles: ['super_admin'],
        exp: Math.floor(Date.now() / 1000) + 900,
      });

      const mockFetch = vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
        if (url.includes('/v1/auth/login')) {
          const body = JSON.parse(String(init?.body));
          expect(body.provider).toBe('google');
          expect(body.code).toBe(targetEmail);
          return new Response(
            JSON.stringify({
              mfaRequired: true,
              mfaToken,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }

        if (url.includes('/v1/auth/totp/verify')) {
          const body = JSON.parse(String(init?.body));
          expect(body.mfaToken).toBe(mfaToken);
          expect(body.totpCode).toBe(totpCode);
          return new Response(
            JSON.stringify({
              accessToken: finalAccessToken,
              expiresIn: 900,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }

        return new Response('Not Found', { status: 404 });
      });

      global.fetch = mockFetch;

      const success = await useAdminAuthStore.getState().login(targetEmail, totpCode);
      expect(success).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(2);

      // Verify persistence in localStorage ("admin_access_token")
      expect(mockLocalStorage.get(STORAGE_KEYS.ADMIN_ACCESS_TOKEN)).toBe(finalAccessToken);

      // Verify store state
      const state = useAdminAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.accessToken).toBe(finalAccessToken);
      expect(state.adminEmail).toBe(targetEmail);
      expect(state.role).toBe('super_admin');
      expect(state.mfaVerified).toBe(true);
    });

    it('handles direct access token response when MFA challenge is not required', async () => {
      const targetEmail = 'ops@venom.finance';
      const totpCode = '112233';
      const finalAccessToken = createMockJwt({
        sub: 'usr_ops',
        email: targetEmail,
        roles: ['admin'],
        exp: Math.floor(Date.now() / 1000) + 900,
      });

      global.fetch = vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            accessToken: finalAccessToken,
            mfaRequired: false,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );

      const success = await useAdminAuthStore.getState().login(targetEmail, totpCode);
      expect(success).toBe(true);
      expect(mockLocalStorage.get(STORAGE_KEYS.ADMIN_ACCESS_TOKEN)).toBe(finalAccessToken);

      const state = useAdminAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.accessToken).toBe(finalAccessToken);
    });

    it('resets store and clears localStorage when login fails with HTTP 401', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ error: 'invalid credentials' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        )
      );

      await expect(
        useAdminAuthStore.getState().login('invalid@venom.finance', '000000')
      ).rejects.toThrow();

      expect(mockLocalStorage.get(STORAGE_KEYS.ADMIN_ACCESS_TOKEN)).toBeUndefined();
      const state = useAdminAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.accessToken).toBeNull();
    });

    it('resets store and clears localStorage when TOTP verification fails with HTTP 401', async () => {
      const mockFetch = vi.fn().mockImplementation(async (url: string) => {
        if (url.includes('/v1/auth/login')) {
          return new Response(
            JSON.stringify({ mfaRequired: true, mfaToken: 'temp_mfa_token' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }
        if (url.includes('/v1/auth/totp/verify')) {
          return new Response(
            JSON.stringify({ error: 'invalid TOTP code' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          );
        }
        return new Response('Not Found', { status: 404 });
      });

      global.fetch = mockFetch;

      await expect(
        useAdminAuthStore.getState().login('admin@venom.finance', '999999')
      ).rejects.toThrow('invalid TOTP code');

      expect(mockLocalStorage.get(STORAGE_KEYS.ADMIN_ACCESS_TOKEN)).toBeUndefined();
      const state = useAdminAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.accessToken).toBeNull();
    });

    it('logout() clears active token from localStorage and resets state', () => {
      const token = createMockJwt({ sub: 'usr_to_logout' });
      useAdminAuthStore.getState().setToken(token, 'to_logout@venom.finance');
      expect(useAdminAuthStore.getState().isAuthenticated).toBe(true);
      expect(mockLocalStorage.get(STORAGE_KEYS.ADMIN_ACCESS_TOKEN)).toBe(token);

      useAdminAuthStore.getState().logout();
      expect(useAdminAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAdminAuthStore.getState().accessToken).toBeNull();
      expect(mockLocalStorage.get(STORAGE_KEYS.ADMIN_ACCESS_TOKEN)).toBeUndefined();
    });
  });

  describe('adminFetch Client Token Injection & 401 Handling', () => {
    it('automatically injects Authorization: Bearer ${token} from useAdminAuthStore', async () => {
      const token = createMockJwt({ sub: 'usr_authed', email: 'authed@venom.finance' });
      useAdminAuthStore.getState().setToken(token);

      let capturedHeaders: Headers | undefined;
      global.fetch = vi.fn().mockImplementation(async (_url: string, init?: RequestInit) => {
        capturedHeaders = new Headers(init?.headers);
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      });

      const res = await adminFetch('/v1/admin/stats');
      expect(res.ok).toBe(true);
      expect(capturedHeaders?.get('Authorization')).toBe(`Bearer ${token}`);
      expect(capturedHeaders?.get('traceparent')).toMatch(/^00-[0-9a-f]{32}-[0-9a-f]{16}-01$/);
    });

    it('falls back to retrieving JWT from localStorage when store state is empty', async () => {
      useAdminAuthStore.getState().logout();
      const token = createMockJwt({ sub: 'usr_from_storage' });
      mockLocalStorage.set(STORAGE_KEYS.ADMIN_ACCESS_TOKEN, token);

      let capturedHeaders: Headers | undefined;
      global.fetch = vi.fn().mockImplementation(async (_url: string, init?: RequestInit) => {
        capturedHeaders = new Headers(init?.headers);
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      });

      await adminFetch('/v1/admin/users');
      expect(capturedHeaders?.get('Authorization')).toBe(`Bearer ${token}`);
    });

    it('preserves caller-specified Authorization header if already present', async () => {
      const storeToken = createMockJwt({ sub: 'usr_store' });
      useAdminAuthStore.getState().setToken(storeToken);

      const customAuth = 'Bearer custom_override_token';
      let capturedHeaders: Headers | undefined;
      global.fetch = vi.fn().mockImplementation(async (_url: string, init?: RequestInit) => {
        capturedHeaders = new Headers(init?.headers);
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      });

      await adminFetch('/v1/admin/users', {
        headers: { Authorization: customAuth },
      });
      expect(capturedHeaders?.get('Authorization')).toBe(customAuth);
    });

    it('on 401 Unauthorized: clears stored token and triggers redirect to /login', async () => {
      const token = createMockJwt({ sub: 'usr_revoked' });
      useAdminAuthStore.getState().setToken(token);
      expect(useAdminAuthStore.getState().isAuthenticated).toBe(true);
      expect(mockLocalStorage.get(STORAGE_KEYS.ADMIN_ACCESS_TOKEN)).toBe(token);

      global.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: 'unauthorized session' }), { status: 401 })
      );

      const res = await adminFetch('/v1/admin/bots');
      expect(res.status).toBe(401);

      // Verify token cleared from store and storage
      expect(useAdminAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAdminAuthStore.getState().accessToken).toBeNull();
      expect(mockLocalStorage.get(STORAGE_KEYS.ADMIN_ACCESS_TOKEN)).toBeUndefined();

      // Verify redirect triggered to /login
      expect(window.location.href).toBe('/login');
    });

    it('on 401 Unauthorized: does not trigger redirect loop if endpoint is auth login or verify', async () => {
      const windowLocation = {
        origin: 'http://localhost:3002',
        pathname: '/login',
        href: 'http://localhost:3002/login',
      };
      vi.stubGlobal('window', {
        localStorage: {
          getItem: (key: string) => mockLocalStorage.get(key) ?? null,
          setItem: (key: string, value: string) => mockLocalStorage.set(key, value),
          removeItem: (key: string) => mockLocalStorage.delete(key),
        },
        location: windowLocation,
      });

      global.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: 'unauthenticated' }), { status: 401 })
      );

      const res = await adminFetch('/v1/auth/login');
      expect(res.status).toBe(401);
      // href should not have been mutated to an infinite loop redirect
      expect(windowLocation.href).toBe('http://localhost:3002/login');
    });
  });
});
