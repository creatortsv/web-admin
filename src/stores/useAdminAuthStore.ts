import { create } from 'zustand';
import { STORAGE_KEYS } from '@/lib/constants/storage';
import type { LoginWireResponse, VerifyTOTPWireResponse } from '@/types/contracts/auth';

export interface JwtClaims {
  sub?: string;
  email?: string;
  roles?: string[];
  token_type?: string;
  family_id?: string;
  iss?: string;
  aud?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

export interface AdminAuthStore {
  isAuthenticated: boolean;
  adminEmail: string;
  role: 'super_admin' | 'admin';
  mfaVerified: boolean;
  accessToken: string | null;
  login: (email: string, totpCode: string) => Promise<boolean>;
  logout: () => void;
  setToken: (token: string, email?: string, role?: 'super_admin' | 'admin') => void;
  syncFromStorage: () => void;
}

/**
 * Safely parses the JSON payload from a JWT string without verifying the cryptographic signature.
 * Cryptographic verification is enforced server-side and on the edge gateway.
 */
export function parseJwtPayload(token: string): JwtClaims | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = typeof atob === 'function'
      ? atob(base64)
      : Buffer.from(base64, 'base64').toString('utf-8');
    return JSON.parse(jsonPayload) as JwtClaims;
  } catch {
    return null;
  }
}

/**
 * Evaluates whether a JWT token is expired based on its exp claim.
 */
export function isTokenExpired(token: string): boolean {
  const payload = parseJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number' || !Number.isFinite(payload.exp)) {
    return false;
  }
  // 5-second clock skew tolerance
  return payload.exp * 1000 <= Date.now() - 5000;
}

/**
 * Retrieves the initial auth state from localStorage ("admin_access_token").
 * Client-side mock auth bypass is strictly purged.
 */
export function getInitialAuthState(): {
  isAuthenticated: boolean;
  adminEmail: string;
  role: 'super_admin' | 'admin';
  mfaVerified: boolean;
  accessToken: string | null;
} {
  if (typeof window === 'undefined' || !window.localStorage) {
    return {
      isAuthenticated: false,
      adminEmail: '',
      role: 'admin',
      mfaVerified: false,
      accessToken: null,
    };
  }

  try {
    const token = localStorage.getItem(STORAGE_KEYS.ADMIN_ACCESS_TOKEN);
    if (!token || !token.trim()) {
      return {
        isAuthenticated: false,
        adminEmail: '',
        role: 'admin',
        mfaVerified: false,
        accessToken: null,
      };
    }

    if (isTokenExpired(token)) {
      try {
        localStorage.removeItem(STORAGE_KEYS.ADMIN_ACCESS_TOKEN);
      } catch {
        // ignore
      }
      return {
        isAuthenticated: false,
        adminEmail: '',
        role: 'admin',
        mfaVerified: false,
        accessToken: null,
      };
    }

    const payload = parseJwtPayload(token);
    const email = payload && typeof payload.email === 'string' && payload.email
      ? payload.email
      : (payload && typeof payload.sub === 'string' ? payload.sub : '');
    const roles = payload && Array.isArray(payload.roles) ? payload.roles : [];
    const role: 'super_admin' | 'admin' = roles.includes('super_admin') ? 'super_admin' : 'admin';

    return {
      isAuthenticated: true,
      adminEmail: email,
      role,
      mfaVerified: true,
      accessToken: token,
    };
  } catch {
    return {
      isAuthenticated: false,
      adminEmail: '',
      role: 'admin',
      mfaVerified: false,
      accessToken: null,
    };
  }
}

export const useAdminAuthStore = create<AdminAuthStore>((set) => ({
  ...getInitialAuthState(),

  login: async (email: string, totpCode: string): Promise<boolean> => {
    const trimmedEmail = email ? email.trim() : '';
    const trimmedTotp = totpCode ? totpCode.trim() : '';

    if (!trimmedEmail || !trimmedTotp || trimmedTotp.length !== 6) {
      return false;
    }

    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const loginUrl = typeof window === 'undefined'
        ? `http://127.0.0.1:${process.env.PORT || '3002'}/v1/auth/login`
        : '/v1/auth/login';

      const loginRes = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'google',
          code: trimmedEmail,
          redirectUri: origin,
          redirect_uri: origin,
        }),
      });

      if (!loginRes.ok) {
        let errMsg = `Authentication failed (HTTP ${loginRes.status})`;
        try {
          const errData = await loginRes.json();
          if (errData?.message || errData?.error) {
            errMsg = String(errData.message || errData.error);
          }
        } catch {
          // ignore
        }
        throw new Error(errMsg);
      }

      const loginData = (await loginRes.json()) as LoginWireResponse;
      const mfaRequired = Boolean(loginData.mfaRequired || loginData.mfa_required);
      const mfaToken = (loginData.mfaToken || loginData.mfa_token || '') as string;
      const initialAccessToken = (loginData.accessToken || loginData.access_token || '') as string;

      let finalAccessToken = '';

      if (mfaToken || mfaRequired) {
        const verifyUrl = typeof window === 'undefined'
          ? `http://127.0.0.1:${process.env.PORT || '3002'}/v1/auth/totp/verify`
          : '/v1/auth/totp/verify';

        const verifyRes = await fetch(verifyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mfaToken: mfaToken,
            mfa_token: mfaToken,
            totpCode: trimmedTotp,
            totp_code: trimmedTotp,
          }),
        });

        if (!verifyRes.ok) {
          let errMsg = `TOTP verification failed (HTTP ${verifyRes.status})`;
          try {
            const errData = await verifyRes.json();
            if (errData?.message || errData?.error) {
              errMsg = String(errData.message || errData.error);
            }
          } catch {
            // ignore
          }
          throw new Error(errMsg);
        }

        const verifyData = (await verifyRes.json()) as VerifyTOTPWireResponse;
        finalAccessToken = (verifyData.accessToken || verifyData.access_token || '') as string;
      } else if (initialAccessToken) {
        finalAccessToken = initialAccessToken;
      }

      if (!finalAccessToken) {
        throw new Error('Authentication succeeded but no access token was returned');
      }

      // Persist in localStorage ("admin_access_token")
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          localStorage.setItem(STORAGE_KEYS.ADMIN_ACCESS_TOKEN, finalAccessToken);
        } catch {
          // ignore
        }
      }

      const payload = parseJwtPayload(finalAccessToken);
      const tokenEmail = payload && typeof payload.email === 'string' && payload.email
        ? payload.email
        : (payload && typeof payload.sub === 'string' && payload.sub ? payload.sub : trimmedEmail);
      const roles = payload && Array.isArray(payload.roles) ? payload.roles : [];
      const role: 'super_admin' | 'admin' = roles.includes('super_admin') ? 'super_admin' : 'super_admin';

      set({
        isAuthenticated: true,
        adminEmail: tokenEmail,
        role,
        mfaVerified: true,
        accessToken: finalAccessToken,
      });

      return true;
    } catch (error) {
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          localStorage.removeItem(STORAGE_KEYS.ADMIN_ACCESS_TOKEN);
        } catch {
          // ignore
        }
      }
      set({
        isAuthenticated: false,
        adminEmail: '',
        role: 'admin',
        mfaVerified: false,
        accessToken: null,
      });
      throw error;
    }
  },

  logout: () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.removeItem(STORAGE_KEYS.ADMIN_ACCESS_TOKEN);
      } catch {
        // ignore
      }
    }
    set({
      isAuthenticated: false,
      adminEmail: '',
      role: 'admin',
      mfaVerified: false,
      accessToken: null,
    });
  },

  setToken: (token: string, email?: string, role?: 'super_admin' | 'admin') => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(STORAGE_KEYS.ADMIN_ACCESS_TOKEN, token);
      } catch {
        // ignore
      }
    }

    const payload = parseJwtPayload(token);
    const derivedEmail = email || (payload && typeof payload.email === 'string' ? payload.email : '') || (payload && typeof payload.sub === 'string' ? payload.sub : '');
    const roles = payload && Array.isArray(payload.roles) ? payload.roles : [];
    const derivedRole: 'super_admin' | 'admin' = role || (roles.includes('super_admin') ? 'super_admin' : 'admin');

    set({
      isAuthenticated: true,
      adminEmail: derivedEmail,
      role: derivedRole,
      mfaVerified: true,
      accessToken: token,
    });
  },

  syncFromStorage: () => {
    set(getInitialAuthState());
  },
}));
