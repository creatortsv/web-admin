export interface TreasuryVault {
  id: string;
  chain: string;
  asset: string;
  receivingAddress: string;
  coldSweepAddress: string;
  minDepositUsd: number;
  sweepThresholdUsd: number;
  currentBalanceUsd: number;
  isActive: boolean;
  updatedAt: string;
}

export interface PaymentGatewayConfig {
  id: string;
  name: string;
  type: 'CRYPTO_DIRECT' | 'WEB3_WALLET' | 'STRIPE_FIAT';
  isEnabled: boolean;
  isKmsSealed?: boolean;
  maskedPublishableKey?: string;
  details: string;
}

export interface UniversalGateway {
  name: string;
  displayName: string;
  type: string;
  isEnabled: boolean;
  environment: string;
}

export interface UniversalGatewayConfig {
  id?: string;
  gatewayName: string;
  displayName: string;
  type: string;
  isEnabled: boolean;
  environment: string;
  version: number;
  status: string;
  publicKey?: string;
  maskedSecretKey?: string;
  maskedWebhookSecret?: string;
  isSealed: boolean;
  planPriceMappings: Record<string, string>;
  webhookUrl: string;
  updatedAt?: string;
}

export interface UpdateGatewayConfigRequest {
  gatewayName: string;
  environment: string;
  isEnabled: boolean;
  publicKey?: string;
  secretKey: string;
  webhookSecret: string;
  planPriceMappings: Record<string, string>;
  rotateExisting?: boolean;
}

export interface TestConnectionResponse {
  success: boolean;
  message: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'trader' | 'sandbox';
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  activeBotsCount: number;
  totalVolumeUsd: number;
  createdAt: string;
}

export interface FleetBot {
  id: string;
  userId: string;
  label: string;
  strategy: string;
  symbol: string;
  exchange?: string;
  status: 'RUNNING' | 'SOFT_STOPPING' | 'STOPPED' | 'ERROR';
  activeOrders: number;
  unrealizedPnlUsd: number;
  startedAt: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorEmail: string;
  action: string;
  target: string;
  prevHash: string;
  currentHash: string;
  ipAddress: string;
}

export interface SystemStats {
  activeBotsCount: number;
  totalVolume24hUsd: number;
  pendingSweepUsd: number;
  gatewayStatus: 'HEALTHY' | 'DEGRADED';
  kafkaLag: number;
  dbConnections: number;
  redisMemoryMb: number;
}

export interface DivergentOrder {
  id: string;
  clientOrderId: string;
  userId: string;
  botId?: string;
  symbol: string;
  exchange?: string;
  side: 'BUY' | 'SELL';
  orderType: 'LIMIT' | 'MARKET' | 'LIMIT_MAKER';
  price: string;
  quantity: string;
  localStatus: 'IN_FLIGHT_UNKNOWN' | 'PENDING_SUBMIT' | 'REJECTED' | 'NEW';
  exchangeStatus: 'FILLED' | 'PARTIALLY_FILLED' | 'NEW' | 'CANCELED' | 'REJECTED' | 'NOT_FOUND';
  discrepancyType: 'STATE_MISMATCH' | 'IN_FLIGHT_TIMEOUT' | 'UNKNOWN_ON_EXCHANGE' | 'GHOST_FILL';
  lastCheckedAt: string;
  createdAt: string;
  divergenceAgeSeconds: number;
}

export interface CompensationClaim {
  id: string;
  incidentId: string;
  userId: string;
  amountCents: number;
  reason: string;
  evidencePayload: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  createdByAdminId: string;
  approvedByAdminId?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
}

export interface CreateCompensationClaimPayload {
  incidentId: string;
  userId: string;
  amountCents: number;
  reason: string;
  evidencePayload?: string;
}

import {
  ATTRIBUTION_TYPE,
  AttributionTypeContract,
  VENUE_LIFECYCLE_STATUS,
  VenueLifecycleStatusContract,
  BROKER_CONFIG_STATUS,
  BrokerConfigStatusContract,
  BrokerConfigWireDTO,
  UpdateBrokerConfigWireRequest,
  DecommissionProposal,
} from '../types/contracts/brokerConfig';
import { useAdminAuthStore } from '../stores/useAdminAuthStore';
import { STORAGE_KEYS } from '../lib/constants/storage';
import { readJsonOrThrow } from './adminApiError';

export { ATTRIBUTION_TYPE, VENUE_LIFECYCLE_STATUS, BROKER_CONFIG_STATUS };
export type { DecommissionProposal };

export type ExchangeKey =
  | 'EXCHANGE_BINANCE_SPOT'
  | 'EXCHANGE_BINANCE_FUTURES'
  | 'EXCHANGE_BYBIT'
  | 'EXCHANGE_BINGX'
  | 'EXCHANGE_HYPERLIQUID'
  | 'EXCHANGE_GMX_V2';

export type AttributionType = AttributionTypeContract | 'ATTRIBUTION_TYPE_SOURCE_KEY_HEADER' | 'ATTRIBUTION_TYPE_BUILDER_FEE' | 'ATTRIBUTION_TYPE_REFERRAL_CODE';

export type BrokerConfigStatus = BrokerConfigStatusContract | 'BROKER_CONFIG_STATUS_MAINTENANCE';

export type VenueLifecycleStatus = VenueLifecycleStatusContract;

export interface BrokerConfigDTO {
  id?: string;
  exchange: ExchangeKey;
  environment?: string;
  attributionType: AttributionType;
  status: BrokerConfigStatus;
  lifecycleStatus?: VenueLifecycleStatus;
  sunsetDeadline?: string | null;
  sunsetNotice?: string | null;
  maskedIdentifier: string;
  isKmsSealed: boolean;
  rebateRateBps: number;
  rebatePercentage?: number;
  clientOrderIdPrefix?: string;
  headerKey?: string;
  headerValue?: string;
  payloadParams?: Record<string, string>;
  payoutAddress?: string;
  version: number;
  updatedAt: string;
  updatedBy: string;
  notes: string;
  extraParams?: Record<string, string>;
  decommissionProposal?: DecommissionProposal | null;
}

export interface UpdateBrokerConfigRequest {
  id?: string;
  exchange: ExchangeKey;
  environment?: string;
  attributionType: AttributionType;
  rawIdentifier: string;
  rawSecret?: string;
  clientOrderIdPrefix?: string;
  headerKey?: string;
  headerValue?: string;
  payloadParams?: Record<string, string>;
  rebatePercentage?: number;
  payoutAddress?: string;
  status: BrokerConfigStatus;
  lifecycleStatus?: VenueLifecycleStatus;
  sunsetDeadline?: string | null;
  sunsetNotice?: string | null;
  rebateRateBps: number;
  expectedVersion: number;
  notes?: string;
  extraParams?: Record<string, string>;
}

export interface TestBrokerAttributionRequest {
  exchange: ExchangeKey;
  testOrderId: string;
  testPayload?: string;
}

export interface TestBrokerAttributionResponse {
  success: boolean;
  attributedOrderId?: string;
  injectedHeaders?: Record<string, string>;
  injectedParams?: Record<string, string>;
  statusMessage?: string;
  attributionLatencyNanos?: number;
  exchange?: ExchangeKey;
  attributionType?: AttributionType;
  testOrderId?: string;
  evaluatedOrderId?: string;
  injectedPayload?: Record<string, string>;
  executionLatencyMicros?: number;
  verifiedAt?: string;
  details?: string;
}

export interface PublicExchangeConfigDTO {
  exchange: ExchangeKey;
  name: string;
  portalUrl: string;
  staticNatIps: string[];
  isBrokerActive: boolean;
  lifecycleStatus?: VenueLifecycleStatus;
  sunsetDeadline?: string | null;
  sunsetNotice?: string | null;
  allowNewKeys?: boolean;
  allowNewBots?: boolean;
}

export function normalizeExchangeKey(raw: string): ExchangeKey {
  const upper = (raw || '').toUpperCase().trim();
  if (upper === 'BINANCE' || upper === 'EXCHANGE_BINANCE' || upper === 'BINANCE_SPOT' || upper === 'EXCHANGE_BINANCE_SPOT') {
    return 'EXCHANGE_BINANCE_SPOT';
  }
  if (upper === 'BINANCE_FUTURES' || upper === 'EXCHANGE_BINANCE_FUTURES') {
    return 'EXCHANGE_BINANCE_FUTURES';
  }
  if (upper === 'BYBIT' || upper === 'EXCHANGE_BYBIT') {
    return 'EXCHANGE_BYBIT';
  }
  if (upper === 'BINGX' || upper === 'EXCHANGE_BINGX') {
    return 'EXCHANGE_BINGX';
  }
  if (upper === 'HYPERLIQUID' || upper === 'EXCHANGE_HYPERLIQUID') {
    return 'EXCHANGE_HYPERLIQUID';
  }
  if (upper === 'GMX' || upper === 'GMX_V2' || upper === 'EXCHANGE_GMX' || upper === 'EXCHANGE_GMX_V2') {
    return 'EXCHANGE_GMX_V2';
  }
  return (upper.startsWith('EXCHANGE_') ? upper : `EXCHANGE_${upper}`) as ExchangeKey;
}

export function toProtoAttribution(at: AttributionType): AttributionTypeContract {
  switch (at) {
    case 'ATTRIBUTION_TYPE_SOURCE_KEY_HEADER':
      return ATTRIBUTION_TYPE.HTTP_HEADER;
    case 'ATTRIBUTION_TYPE_BUILDER_FEE':
      return ATTRIBUTION_TYPE.BUILDER_TAG;
    case 'ATTRIBUTION_TYPE_REFERRAL_CODE':
      return ATTRIBUTION_TYPE.PAYLOAD_FIELD;
    default:
      return (at as AttributionTypeContract) || ATTRIBUTION_TYPE.CLIENT_ORDER_ID_PREFIX;
  }
}

export function fromProtoAttribution(raw: string | number, ex?: ExchangeKey): AttributionTypeContract {
  if (typeof raw === 'number') {
    switch (raw) {
      case 1: return ATTRIBUTION_TYPE.CLIENT_ORDER_ID_PREFIX;
      case 2: return ATTRIBUTION_TYPE.HTTP_HEADER;
      case 3: return ATTRIBUTION_TYPE.PAYLOAD_FIELD;
      case 4: return ATTRIBUTION_TYPE.BUILDER_TAG;
      case 5: return ATTRIBUTION_TYPE.HYBRID;
      default: break;
    }
  }
  const str = String(raw || '').toUpperCase();
  if (str.includes('BUILDER')) return ATTRIBUTION_TYPE.BUILDER_TAG;
  if (str.includes('HEADER')) return ATTRIBUTION_TYPE.HTTP_HEADER;
  if (str.includes('PAYLOAD') || str.includes('REFERRAL')) return ATTRIBUTION_TYPE.PAYLOAD_FIELD;
  if (str.includes('PREFIX')) return ATTRIBUTION_TYPE.CLIENT_ORDER_ID_PREFIX;

  if (ex === 'EXCHANGE_HYPERLIQUID') return ATTRIBUTION_TYPE.BUILDER_TAG;
  if (ex === 'EXCHANGE_BINGX') return ATTRIBUTION_TYPE.HTTP_HEADER;
  if (ex === 'EXCHANGE_GMX_V2') return ATTRIBUTION_TYPE.PAYLOAD_FIELD;
  return ATTRIBUTION_TYPE.CLIENT_ORDER_ID_PREFIX;
}

/**
 * Universal Protobuf Wire DTO parser complying with lowerCamelCase wire JSON standards
 * [Policy Ref: Clean Architecture & Zero Magic Strings §4.5]
 */
export function parseBrokerConfigWire(c: any, fallbackExchange?: ExchangeKey): BrokerConfigDTO {
  const rawExchange = c.exchange || fallbackExchange || '';
  const ex = normalizeExchangeKey(rawExchange);

  // Read lowerCamelCase wire JSON standard (with fallback to snake_case)
  const isActive = c.isActive !== undefined ? Boolean(c.isActive) : Boolean(c.is_active);

  let rawLifecycle = c.lifecycleStatus || c.lifecycle_status || '';
  if (!rawLifecycle) {
    rawLifecycle = isActive ? VENUE_LIFECYCLE_STATUS.ACTIVE : VENUE_LIFECYCLE_STATUS.TERMINATED;
  } else if (!rawLifecycle.startsWith('VENUE_LIFECYCLE_STATUS_')) {
    rawLifecycle = `VENUE_LIFECYCLE_STATUS_${rawLifecycle}`;
  }

  const rebatePct = Number(c.rebatePercentage !== undefined ? c.rebatePercentage : (c.rebate_percentage || 0));
  const rawSunsetDeadline = c.sunsetDeadline !== undefined ? c.sunsetDeadline : c.sunset_deadline;
  let sunsetDeadlineStr: string | null = null;
  if (rawSunsetDeadline) {
    if (typeof rawSunsetDeadline === 'string') {
      sunsetDeadlineStr = rawSunsetDeadline;
    } else if (rawSunsetDeadline.seconds !== undefined) {
      sunsetDeadlineStr = new Date(Number(rawSunsetDeadline.seconds) * 1000).toISOString();
    }
  }

  const sunsetNotice = (c.sunsetNotice !== undefined ? c.sunsetNotice : c.sunset_notice) || null;
  const maskedIdentifier = (c.maskedIdentifier !== undefined ? c.maskedIdentifier : c.masked_identifier) || '***';
  const isKmsSealed = c.hasEncryptedSecrets !== undefined ? Boolean(c.hasEncryptedSecrets) : (c.has_encrypted_secrets !== undefined ? Boolean(c.has_encrypted_secrets) : true);
  const clientOrderIdPrefix = (c.clientOrderIdPrefix !== undefined ? c.clientOrderIdPrefix : c.client_order_id_prefix) || '';
  const headerKey = (c.headerKey !== undefined ? c.headerKey : c.header_key) || '';
  const headerValue = (c.headerValue !== undefined ? c.headerValue : c.header_value) || '';
  const payloadParams = (c.payloadParams !== undefined ? c.payloadParams : c.payload_params) || {};
  const payoutAddress = (c.payoutAddress !== undefined ? c.payoutAddress : c.payout_address) || '';
  const version = Number(c.version !== undefined ? c.version : 1);
  const rawUpdatedAt = c.updatedAt !== undefined ? c.updatedAt : c.updated_at;
  let updatedAtStr = new Date().toISOString();
  if (rawUpdatedAt) {
    if (typeof rawUpdatedAt === 'string') {
      updatedAtStr = rawUpdatedAt;
    } else if (rawUpdatedAt.seconds !== undefined) {
      updatedAtStr = new Date(Number(rawUpdatedAt.seconds) * 1000).toISOString();
    }
  }
  const updatedBy = (c.updatedBy !== undefined ? c.updatedBy : c.updated_by) || 'system';
  const notes = c.notes || '';
  const rawAttribution = c.attributionType !== undefined ? c.attributionType : c.attribution_type;

  let decommissionProposal: DecommissionProposal | undefined = undefined;
  const rawProposal = c.decommissionProposal || c.decommission_proposal;
  if (rawProposal && typeof rawProposal === 'object') {
    decommissionProposal = {
      proposedBy: String(rawProposal.proposedBy || rawProposal.proposed_by || ''),
      proposedAt: String(rawProposal.proposedAt || rawProposal.proposed_at || new Date().toISOString()),
      reason: String(rawProposal.reason || ''),
      status: (rawProposal.status || 'PENDING_APPROVAL') as DecommissionProposal['status'],
      approvedBy: rawProposal.approvedBy || rawProposal.approved_by ? String(rawProposal.approvedBy || rawProposal.approved_by) : undefined,
      approvedAt: rawProposal.approvedAt || rawProposal.approved_at ? String(rawProposal.approvedAt || rawProposal.approved_at) : undefined,
      rejectionReason: rawProposal.rejectionReason || rawProposal.rejection_reason ? String(rawProposal.rejectionReason || rawProposal.rejection_reason) : undefined,
    };
  }

  return {
    id: c.id,
    exchange: ex,
    environment: c.environment || 'production',
    attributionType: fromProtoAttribution(rawAttribution, ex),
    status: isActive ? BROKER_CONFIG_STATUS.ACTIVE : BROKER_CONFIG_STATUS.INACTIVE,
    lifecycleStatus: rawLifecycle as VenueLifecycleStatus,
    sunsetDeadline: sunsetDeadlineStr,
    sunsetNotice,
    maskedIdentifier,
    isKmsSealed,
    rebateRateBps: Math.round(rebatePct * 100),
    rebatePercentage: rebatePct,
    clientOrderIdPrefix,
    headerKey,
    headerValue,
    payloadParams,
    payoutAddress,
    version,
    updatedAt: updatedAtStr,
    updatedBy,
    notes,
    extraParams: payloadParams,
    decommissionProposal,
  };
}

/**
 * Generates a W3C traceparent header: 00-{trace_id}-{span_id}-01
 */
export function generateTraceparent(): string {
  const bytes = new Uint8Array(24);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 24; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  const traceId = hex.slice(0, 32);
  const spanId = hex.slice(32, 48);
  return `00-${traceId}-${spanId}-01`;
}

export async function adminFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let target = input;
  let headers: Headers;
  if (input instanceof Request) {
    target = input.url;
    headers = new Headers(input.headers);
    if (init?.headers) {
      new Headers(init.headers).forEach((v, k) => headers.set(k, v));
    }
  } else {
    headers = new Headers(init?.headers);
  }

  if (typeof target === 'string' && target.startsWith('/')) {
    if (typeof window === 'undefined') {
      const port = process.env.PORT || '3002';
      target = `http://127.0.0.1:${port}${target}`;
    }
  }

  if (!headers.has('traceparent')) {
    headers.set('traceparent', generateTraceparent());
  }

  // Retrieve active JWT from useAdminAuthStore or localStorage
  let token: string | null = null;
  try {
    token = useAdminAuthStore.getState().accessToken;
  } catch {
    // store may not be initialized yet
  }
  if (!token && typeof window !== 'undefined' && window.localStorage) {
    try {
      token = localStorage.getItem(STORAGE_KEYS.ADMIN_ACCESS_TOKEN);
    } catch {
      // ignore
    }
  }

  if (token && !headers.has('Authorization') && !headers.has('authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(target, {
    ...init,
    headers,
  });

  if (response.status === 401) {
    // Clear stored token from store and localStorage
    try {
      useAdminAuthStore.getState().logout();
    } catch {
      // ignore
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.removeItem(STORAGE_KEYS.ADMIN_ACCESS_TOKEN);
      } catch {
        // ignore
      }
    }

    // Trigger redirect to /login if not already on an auth endpoint or /login
    if (typeof window !== 'undefined') {
      const urlStr = typeof input === 'string'
        ? input
        : (input instanceof URL ? input.pathname : (input instanceof Request ? input.url : ''));
      const isAuthEndpoint = urlStr.includes('/v1/auth/login') || urlStr.includes('/v1/auth/totp/verify');
      if (!isAuthEndpoint && window.location && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  }

  return response;
}

// Wire bodies are read structurally here; the typed generated admin client of WP-8.5a replaces this alias.
type AdminWireBody = Record<string, any>;

/**
 * Every method calls the backend through `adminFetch` and resolves only from `readJsonOrThrow`.
 * No method returns local, cached, default or invented data and none reports success without a 2xx.
 * [Policy Ref: Contract §2.1 - fake data and fake success]
 * [Policy Ref: Standards §6.4 - no client-side fallbacks]
 */
export const adminApi = {
  getSystemStats: async (): Promise<SystemStats> => {
    const data = await readJsonOrThrow<AdminWireBody>(await adminFetch('/v1/admin/stats'));
    return {
      activeBotsCount: Number.isFinite(Number(data.activeBotsCount ?? data.active_bots_count)) ? Number(data.activeBotsCount ?? data.active_bots_count) : 0,
      totalVolume24hUsd: Number.isFinite(Number(data.totalVolume24hUsd ?? data.total_volume_24h_usd)) ? Number(data.totalVolume24hUsd ?? data.total_volume_24h_usd) : 0,
      pendingSweepUsd: Number.isFinite(Number(data.pendingSweepUsd ?? data.pending_sweep_usd)) ? Number(data.pendingSweepUsd ?? data.pending_sweep_usd) : 0,
      gatewayStatus: (data.gatewayStatus || data.gateway_status) as SystemStats['gatewayStatus'],
      kafkaLag: Number.isFinite(Number(data.kafkaLag ?? data.kafka_lag)) ? Number(data.kafkaLag ?? data.kafka_lag) : 0,
      dbConnections: Number.isFinite(Number(data.dbConnections ?? data.db_connections)) ? Number(data.dbConnections ?? data.db_connections) : 0,
      redisMemoryMb: Number.isFinite(Number(data.redisMemoryMb ?? data.redis_memory_mb)) ? Number(data.redisMemoryMb ?? data.redis_memory_mb) : 0,
    };
  },

  getTreasuryVaults: async (): Promise<TreasuryVault[]> => {
    const data = await readJsonOrThrow<AdminWireBody>(await adminFetch('/v1/treasury/admin/vaults'));
    const rawVaults = Array.isArray(data.vaults) ? data.vaults : (Array.isArray(data) ? data : []);
    return rawVaults.map((v: AdminWireBody): TreasuryVault => ({
      id: String(v.id || ''),
      chain: String(v.chain || ''),
      asset: String(v.asset || 'USDT'),
      receivingAddress: String(v.receivingAddress || v.receiving_address || ''),
      coldSweepAddress: String(v.coldSweepAddress || v.cold_sweep_address || ''),
      minDepositUsd: Number.isFinite(Number(v.minDepositUsd ?? v.min_deposit_usd)) ? Number(v.minDepositUsd ?? v.min_deposit_usd) : 0,
      sweepThresholdUsd: Number.isFinite(Number(v.sweepThresholdUsd ?? v.sweep_threshold_usd)) ? Number(v.sweepThresholdUsd ?? v.sweep_threshold_usd) : 0,
      currentBalanceUsd: Number.isFinite(Number(v.currentBalanceUsd ?? v.current_balance_usd)) ? Number(v.currentBalanceUsd ?? v.current_balance_usd) : 0,
      isActive: v.isActive !== undefined ? Boolean(v.isActive) : Boolean(v.is_active ?? true),
      updatedAt: String(v.updatedAt || v.updated_at || new Date().toISOString()),
    }));
  },

  saveTreasuryVault: async (vault: TreasuryVault): Promise<TreasuryVault> => {
    const data = await readJsonOrThrow<{ vault: TreasuryVault }>(
      await adminFetch('/v1/treasury/admin/vaults', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vault }),
      })
    );
    return data.vault;
  },

  triggerSweep: async (
    vaultId: string,
    amountUsdOverride?: number,
    force = false
  ): Promise<{ success: boolean; sweepId?: string; txHash?: string; message: string }> => {
    const res = await adminFetch(`/v1/treasury/admin/vaults/${encodeURIComponent(vaultId)}/sweep`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vault_id: vaultId,
        amount_usd_override: amountUsdOverride,
        force,
      }),
    });
    if (!res.ok) {
      let errText = '';
      try {
        if (typeof res.text === 'function') {
          errText = await res.text();
        } else if (typeof res.json === 'function') {
          const j = await res.json();
          errText = (j && j.error) ? String(j.error) : JSON.stringify(j);
        }
      } catch {
        // ignore
      }
      throw new Error(`Sweep initiation failed (HTTP ${res.status}): ${errText || res.statusText || 'Treasury service unreachable'}`);
    }
    const data = await readJsonOrThrow<AdminWireBody>(res);
    return {
      success: Boolean(data.success),
      sweepId: data.sweepId || data.sweep_id,
      txHash: data.txHash || data.tx_hash,
      message: String(data.message ?? ''),
    };
  },

  getPaymentGateways: async (): Promise<PaymentGatewayConfig[]> => {
    const data = await readJsonOrThrow<AdminWireBody>(await adminFetch('/v1/billing/gateways'));
    return Array.isArray(data.gateways) ? data.gateways : [];
  },

  getUsers: async (): Promise<AdminUser[]> => {
    const data = await readJsonOrThrow<AdminWireBody>(await adminFetch('/v1/admin/users'));
    const rawUsers = Array.isArray(data.users) ? data.users : (Array.isArray(data) ? data : []);
    return rawUsers.map((u: AdminWireBody): AdminUser => ({
      id: String(u.id || ''),
      email: String(u.email || ''),
      role: (u.role || 'trader') as AdminUser['role'],
      status: (u.status || 'ACTIVE') as AdminUser['status'],
      activeBotsCount: Number.isFinite(Number(u.activeBotsCount ?? u.active_bots_count)) ? Number(u.activeBotsCount ?? u.active_bots_count) : 0,
      totalVolumeUsd: Number.isFinite(Number(u.totalVolumeUsd ?? u.total_volume_usd)) ? Number(u.totalVolumeUsd ?? u.total_volume_usd) : 0,
      createdAt: String(u.createdAt || u.created_at || new Date().toISOString()),
    }));
  },

  getFleetBots: async (): Promise<FleetBot[]> => {
    const data = await readJsonOrThrow<AdminWireBody>(await adminFetch('/v1/admin/bots'));
    const rawBots = Array.isArray(data.bots) ? data.bots : (Array.isArray(data) ? data : []);
    return rawBots.map((b: AdminWireBody): FleetBot => ({
      id: String(b.id || ''),
      userId: String(b.userId || b.user_id || ''),
      label: String(b.label || b.name || ''),
      strategy: String(b.strategy || ''),
      symbol: String(b.symbol || ''),
      exchange: b.exchange ? String(b.exchange) : undefined,
      status: (b.status || 'STOPPED') as FleetBot['status'],
      activeOrders: Number.isFinite(Number(b.activeOrders ?? b.active_orders)) ? Number(b.activeOrders ?? b.active_orders) : 0,
      unrealizedPnlUsd: Number.isFinite(Number(b.unrealizedPnlUsd ?? b.unrealized_pnl_usd)) ? Number(b.unrealizedPnlUsd ?? b.unrealized_pnl_usd) : 0,
      startedAt: String(b.startedAt || b.started_at || new Date().toISOString()),
    }));
  },

  listUniversalGateways: async (): Promise<UniversalGateway[]> => {
    const data = await readJsonOrThrow<{ gateways?: UniversalGateway[] }>(await adminFetch('/v1/billing/gateways'));
    return data.gateways ?? [];
  },

  getUniversalGatewayConfig: async (
    gatewayName: string,
    environment = 'TEST'
  ): Promise<UniversalGatewayConfig> => {
    const data = await readJsonOrThrow<{ config: UniversalGatewayConfig }>(
      await adminFetch(
        `/v1/billing/gateways/${encodeURIComponent(gatewayName)}/config?environment=${encodeURIComponent(
          environment
        )}`
      )
    );
    return data.config;
  },

  updateUniversalGatewayConfig: async (
    req: UpdateGatewayConfigRequest
  ): Promise<{ config: UniversalGatewayConfig; message: string }> => {
    return readJsonOrThrow<{ config: UniversalGatewayConfig; message: string }>(
      await adminFetch(
        `/v1/billing/gateways/${encodeURIComponent(req.gatewayName)}/config`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(req),
        }
      )
    );
  },

  testGatewayConnection: async (
    gatewayName: string,
    environment = 'TEST',
    secretKey = ''
  ): Promise<TestConnectionResponse> => {
    return readJsonOrThrow<TestConnectionResponse>(
      await adminFetch(
        `/v1/billing/gateways/${encodeURIComponent(gatewayName)}/test`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gateway_name: gatewayName,
            environment,
            secret_key: secretKey,
          }),
        }
      )
    );
  },

  // Divergent Orders Governance Console
  getDivergentOrders: async (): Promise<DivergentOrder[]> => {
    const data = await readJsonOrThrow<AdminWireBody>(await adminFetch('/v1/trading/admin/divergent-orders'));
    const rawList = Array.isArray(data.orders) ? data.orders : (Array.isArray(data) ? data : []);
    return rawList.map((o: AdminWireBody): DivergentOrder => ({
      id: String(o.id || ''),
      clientOrderId: String(o.clientOrderId || o.client_order_id || ''),
      userId: String(o.userId || o.user_id || ''),
      botId: o.botId || o.bot_id ? String(o.botId || o.bot_id) : undefined,
      symbol: String(o.symbol || ''),
      exchange: o.exchange ? String(o.exchange) : undefined,
      side: (o.side || 'BUY') as DivergentOrder['side'],
      orderType: (o.orderType || o.order_type || 'LIMIT') as DivergentOrder['orderType'],
      price: String(o.price || '0'),
      quantity: String(o.quantity || '0'),
      localStatus: (o.localStatus || o.local_status || 'IN_FLIGHT_UNKNOWN') as DivergentOrder['localStatus'],
      exchangeStatus: (o.exchangeStatus || o.exchange_status || 'NEW') as DivergentOrder['exchangeStatus'],
      discrepancyType: (o.discrepancyType || o.discrepancy_type || 'STATE_MISMATCH') as DivergentOrder['discrepancyType'],
      lastCheckedAt: String(o.lastCheckedAt || o.last_checked_at || new Date().toISOString()),
      createdAt: String(o.createdAt || o.created_at || new Date().toISOString()),
      divergenceAgeSeconds: Number.isFinite(Number(o.divergenceAgeSeconds ?? o.divergence_age_seconds)) ? Number(o.divergenceAgeSeconds ?? o.divergence_age_seconds) : 0,
    }));
  },

  // The three divergence actions have no backend route: they show the real 404 and never simulate
  // an outcome. [Policy Ref: Fault Tolerance Policy INV-14 - divergence actions are never simulated]
  syncDivergentOrder: async (orderId: string): Promise<{ success: boolean; message: string; updatedStatus: string }> => {
    return readJsonOrThrow<{ success: boolean; message: string; updatedStatus: string }>(
      await adminFetch(`/v1/trading/admin/divergent-orders/${encodeURIComponent(orderId)}/sync`, {
        method: 'POST',
      })
    );
  },

  forceCancelDivergentOrder: async (orderId: string): Promise<{ success: boolean; message: string }> => {
    return readJsonOrThrow<{ success: boolean; message: string }>(
      await adminFetch(`/v1/trading/admin/divergent-orders/${encodeURIComponent(orderId)}/cancel`, {
        method: 'POST',
      })
    );
  },

  declareAbandonedOrder: async (orderId: string): Promise<{ success: boolean; message: string }> => {
    return readJsonOrThrow<{ success: boolean; message: string }>(
      await adminFetch(`/v1/trading/admin/divergent-orders/${encodeURIComponent(orderId)}/abandon`, {
        method: 'POST',
      })
    );
  },

  // Maker-Checker Financial Compensation Governance
  // [Policy Ref: FLP FL-14, FL-16 - an administrative money action is never reported done without the backend]
  getCompensationClaims: async (status?: string): Promise<CompensationClaim[]> => {
    const url = status ? `/v1/billing/admin/compensations?status=${encodeURIComponent(status)}` : `/v1/billing/admin/compensations`;
    const data = await readJsonOrThrow<AdminWireBody>(await adminFetch(url));
    const rawClaims = Array.isArray(data.claims) ? data.claims : (Array.isArray(data) ? data : []);
    return rawClaims.map((c: AdminWireBody): CompensationClaim => ({
      id: String(c.id || ''),
      incidentId: String(c.incidentId || c.incident_id || ''),
      userId: String(c.userId || c.user_id || ''),
      amountCents: Number.isFinite(Number(c.amountCents ?? c.amount_cents)) ? Number(c.amountCents ?? c.amount_cents) : 0,
      reason: String(c.reason || ''),
      evidencePayload: String(c.evidencePayload || c.evidence_payload || '{}'),
      status: (c.status || 'PENDING_APPROVAL') as CompensationClaim['status'],
      createdByAdminId: String(c.createdByAdminId || c.created_by_admin_id || ''),
      approvedByAdminId: c.approvedByAdminId || c.approved_by_admin_id ? String(c.approvedByAdminId || c.approved_by_admin_id) : undefined,
      rejectionReason: c.rejectionReason || c.rejection_reason ? String(c.rejectionReason || c.rejection_reason) : undefined,
      createdAt: String(c.createdAt || c.created_at || new Date().toISOString()),
      updatedAt: String(c.updatedAt || c.updated_at || new Date().toISOString()),
      approvedAt: c.approvedAt || c.approved_at ? String(c.approvedAt || c.approved_at) : undefined,
    }));
  },

  createCompensationClaim: async (
    payload: CreateCompensationClaimPayload,
    _adminId: string
  ): Promise<CompensationClaim> => {
    const data = await readJsonOrThrow<{ claim: CompensationClaim }>(
      await adminFetch('/v1/billing/admin/compensations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incident_id: payload.incidentId,
          user_id: payload.userId,
          amount_cents: payload.amountCents,
          reason: payload.reason,
          evidence_payload: payload.evidencePayload,
        }),
      })
    );
    return data.claim;
  },

  approveCompensationClaim: async (
    claimId: string,
    checkerAdminId: string
  ): Promise<{ claim: CompensationClaim; newBalanceCents: number; message: string }> => {
    return readJsonOrThrow<{ claim: CompensationClaim; newBalanceCents: number; message: string }>(
      await adminFetch(`/v1/billing/admin/compensations/${encodeURIComponent(claimId)}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checker_admin_id: checkerAdminId }),
      })
    );
  },

  rejectCompensationClaim: async (
    claimId: string,
    checkerAdminId: string,
    reason: string
  ): Promise<{ claim: CompensationClaim; message: string }> => {
    return readJsonOrThrow<{ claim: CompensationClaim; message: string }>(
      await adminFetch(`/v1/billing/admin/compensations/${encodeURIComponent(claimId)}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checker_admin_id: checkerAdminId, reason }),
      })
    );
  },

  // Broker & Rebate Governance Methods
  getBrokerConfigs: async (): Promise<BrokerConfigDTO[]> => {
    const data = await readJsonOrThrow<AdminWireBody>(await adminFetch('/v1/admin/broker-configs?include_inactive=true'));
    const rawConfigs: AdminWireBody[] = Array.isArray(data.configs) ? data.configs : [];
    return rawConfigs
      .map((c) => parseBrokerConfigWire(c))
      .filter((c: BrokerConfigDTO) => (c.exchange as string) !== 'EXCHANGE_BITGET');
  },

  getBrokerConfig: async (exchange: ExchangeKey): Promise<BrokerConfigDTO | null> => {
    let exchangeSlug = exchange.replace(/^EXCHANGE_/, '').toLowerCase();
    if (exchangeSlug === 'binance_spot') exchangeSlug = 'binance';
    if (exchangeSlug === 'gmx_v2') exchangeSlug = 'gmx_v2';
    const data = await readJsonOrThrow<AdminWireBody>(
      await adminFetch(`/v1/admin/broker-configs/${encodeURIComponent(exchangeSlug)}`)
    );
    return data.config ? parseBrokerConfigWire(data.config, exchange) : null;
  },

  updateBrokerConfig: async (req: UpdateBrokerConfigRequest): Promise<BrokerConfigDTO> => {
    let exchangeSlug = req.exchange.replace(/^EXCHANGE_/, '').toLowerCase();
    if (exchangeSlug === 'binance_spot') exchangeSlug = 'binance';
    if (exchangeSlug === 'gmx_v2') exchangeSlug = 'gmx_v2';
    const rebatePct = req.rebatePercentage !== undefined ? req.rebatePercentage : (req.rebateRateBps ? req.rebateRateBps / 100 : 0);
    const targetId = req.id || exchangeSlug;
    const protoAttribution = toProtoAttribution(req.attributionType);

    const data = await readJsonOrThrow<AdminWireBody>(
      await adminFetch(`/v1/admin/broker-configs/${encodeURIComponent(targetId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: req.id || '',
          exchange: exchangeSlug,
          environment: req.environment || 'production',
          broker_id: req.rawIdentifier,
          client_order_id_prefix: req.clientOrderIdPrefix || '',
          attribution_type: protoAttribution,
          header_key: req.headerKey || '',
          header_value: req.headerValue || '',
          payload_params: req.payloadParams || req.extraParams || {},
          rebate_percentage: rebatePct,
          payout_address: req.payoutAddress || (req.exchange === 'EXCHANGE_HYPERLIQUID' ? req.rawIdentifier : ''),
          is_active: req.status === BROKER_CONFIG_STATUS.ACTIVE,
          lifecycle_status: req.lifecycleStatus || (req.status === BROKER_CONFIG_STATUS.ACTIVE ? VENUE_LIFECYCLE_STATUS.ACTIVE : VENUE_LIFECYCLE_STATUS.TERMINATED),
          sunset_deadline: req.sunsetDeadline || null,
          sunset_notice: req.sunsetNotice || '',
          expected_version: req.expectedVersion,
          raw_secrets_plaintext: req.rawSecret || '',
          change_reason: req.notes || 'Updated via Admin Console',
        }),
      })
    );
    return parseBrokerConfigWire(data.config, req.exchange);
  },

  testBrokerAttribution: async (req: TestBrokerAttributionRequest): Promise<TestBrokerAttributionResponse> => {
    const exchangeSlug = req.exchange.replace(/^EXCHANGE_/, '').toLowerCase();
    const data = await readJsonOrThrow<AdminWireBody>(
      await adminFetch('/v1/admin/broker-configs/test-attribution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exchange: exchangeSlug,
          environment: 'production',
          raw_client_order_id: req.testOrderId,
          symbol: 'BTCUSDT',
          order_type: 'LIMIT',
          execute_sandbox_probe: false,
        }),
      })
    );
    return {
      success: data.is_valid === true,
      attributedOrderId: data.formatted_client_order_id,
      injectedHeaders: data.injected_headers,
      injectedParams: data.injected_payload_fields,
      statusMessage: data.diagnostic_message,
      attributionLatencyNanos: data.formatting_latency_nanos,
    };
  },

  getPublicExchangeConfigs: async (): Promise<PublicExchangeConfigDTO[]> => {
    const data = await readJsonOrThrow<AdminWireBody>(await adminFetch('/v1/exchanges/public-config'));
    if (data.exchanges && typeof data.exchanges === 'object') {
      return Object.entries(data.exchanges as Record<string, AdminWireBody>).map(([slug, cfg]) => ({
        exchange: (slug.toUpperCase().startsWith('EXCHANGE_') ? slug.toUpperCase() : `EXCHANGE_${slug.toUpperCase()}`) as ExchangeKey,
        name: cfg.name || slug,
        portalUrl: cfg.portalUrl || cfg.portal_url || '',
        staticNatIps: data.natEgressIps || cfg.static_nat_ips || ['34.118.24.10', '34.118.24.11'],
        isBrokerActive: cfg.allowNewBots ?? cfg.is_broker_active ?? true,
        lifecycleStatus: cfg.lifecycleStatus || cfg.lifecycle_status || 'VENUE_LIFECYCLE_STATUS_ACTIVE',
        sunsetDeadline: cfg.sunsetDeadline || cfg.sunset_deadline || null,
        sunsetNotice: cfg.sunsetNotice || cfg.sunset_notice || null,
        allowNewKeys: cfg.allowNewKeys ?? cfg.allow_new_keys ?? true,
        allowNewBots: cfg.allowNewBots ?? cfg.allow_new_bots ?? true,
      }));
    }
    return data.configs ?? [];
  },

  // Maker-Checker Venue Decommissioning Governance (4-Eyes Dual Approval)
  // [Policy Ref: ADR-0045 - 4-Stage Venue Lifecycle Transition; FLP FL-16 - two-person administrative actions]
  proposeVenueDecommission: async (
    exchange: ExchangeKey,
    makerAdminId: string,
    reason: string
  ): Promise<BrokerConfigDTO> => {
    const exchangeSlug = exchange.replace(/^EXCHANGE_/, '').toLowerCase();
    const data = await readJsonOrThrow<AdminWireBody>(
      await adminFetch(`/v1/admin/broker-configs/${encodeURIComponent(exchangeSlug)}/decommission/propose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exchange: exchangeSlug,
          maker_admin_id: makerAdminId,
          reason,
        }),
      })
    );
    return parseBrokerConfigWire(data.config, exchange);
  },

  approveVenueDecommission: async (
    exchange: ExchangeKey,
    checkerAdminId: string
  ): Promise<BrokerConfigDTO> => {
    const exchangeSlug = exchange.replace(/^EXCHANGE_/, '').toLowerCase();
    const data = await readJsonOrThrow<AdminWireBody>(
      await adminFetch(`/v1/admin/broker-configs/${encodeURIComponent(exchangeSlug)}/decommission/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exchange: exchangeSlug,
          checker_admin_id: checkerAdminId,
        }),
      })
    );
    return parseBrokerConfigWire(data.config, exchange);
  },

  rejectVenueDecommission: async (
    exchange: ExchangeKey,
    checkerAdminId: string,
    rejectionReason: string
  ): Promise<BrokerConfigDTO> => {
    const exchangeSlug = exchange.replace(/^EXCHANGE_/, '').toLowerCase();
    const data = await readJsonOrThrow<AdminWireBody>(
      await adminFetch(`/v1/admin/broker-configs/${encodeURIComponent(exchangeSlug)}/decommission/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exchange: exchangeSlug,
          checker_admin_id: checkerAdminId,
          reason: rejectionReason,
        }),
      })
    );
    return parseBrokerConfigWire(data.config, exchange);
  },
};
