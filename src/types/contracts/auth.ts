/**
 * Canonical Protobuf Wire Contracts for AuthService
 * Single Source of Truth: venom.auth.v1 (proto-definitions)
 * Standard: Protocol Buffers v3 JSON Mapping Specification (lowerCamelCase Wire JSON)
 * [Policy Ref: Clean Architecture & Zero Magic Strings §4.5]
 */

export interface LoginWireRequest {
  provider: string;
  code: string;
  redirectUri?: string;
  redirect_uri?: string;
}

export interface LoginWireResponse {
  accessToken?: string;
  access_token?: string;
  refreshToken?: string;
  refresh_token?: string;
  expiresIn?: number;
  expires_in?: number;
  mfaRequired?: boolean;
  mfa_required?: boolean;
  mfaToken?: string;
  mfa_token?: string;
}

export interface VerifyTOTPWireRequest {
  mfaToken: string;
  mfa_token?: string;
  totpCode: string;
  totp_code?: string;
}

export interface VerifyTOTPWireResponse {
  accessToken: string;
  access_token?: string;
  refreshToken?: string;
  refresh_token?: string;
  expiresIn?: number;
  expires_in?: number;
}
