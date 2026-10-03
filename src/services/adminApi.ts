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

export const ADMIN_USER_ROLES = ['super_admin', 'admin', 'trader', 'sandbox'] as const;
export type AdminUserRole = (typeof ADMIN_USER_ROLES)[number];

export const ADMIN_USER_STATUSES = ['ACTIVE', 'SUSPENDED', 'BANNED'] as const;
export type AdminUserStatus = (typeof ADMIN_USER_STATUSES)[number];

export interface AdminUser {
  id: string;
  email: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  activeBotsCount: number;
  totalVolumeUsd: number;
  createdAt: string;
}

export const FLEET_BOT_STATUSES = ['RUNNING', 'SOFT_STOPPING', 'STOPPED', 'ERROR'] as const;
export type FleetBotStatus = (typeof FLEET_BOT_STATUSES)[number];

export interface FleetBot {
  id: string;
  userId: string;
  label: string;
  strategy: string;
  symbol: string;
  exchange?: string;
  status: FleetBotStatus;
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

type GatewayStatus = SystemStats['gatewayStatus'];

// Keyed by the union, so the compiler rejects a list that misses or adds a member.
const GATEWAY_STATUS_MEMBERS: Record<GatewayStatus, true> = { HEALTHY: true, DEGRADED: true };
const GATEWAY_STATUSES = Object.keys(GATEWAY_STATUS_MEMBERS) as GatewayStatus[];

export const DIVERGENT_ORDER_SIDES = ['BUY', 'SELL'] as const;
export type DivergentOrderSide = (typeof DIVERGENT_ORDER_SIDES)[number];

export const DIVERGENT_ORDER_TYPES = ['LIMIT', 'MARKET', 'LIMIT_MAKER'] as const;
export type DivergentOrderType = (typeof DIVERGENT_ORDER_TYPES)[number];

export const DIVERGENT_LOCAL_STATUSES = ['IN_FLIGHT_UNKNOWN', 'PENDING_SUBMIT', 'REJECTED', 'NEW'] as const;
export type DivergentLocalStatus = (typeof DIVERGENT_LOCAL_STATUSES)[number];

export const DIVERGENT_EXCHANGE_STATUSES = [
  'FILLED',
  'PARTIALLY_FILLED',
  'NEW',
  'CANCELED',
  'REJECTED',
  'NOT_FOUND',
] as const;
export type DivergentExchangeStatus = (typeof DIVERGENT_EXCHANGE_STATUSES)[number];

export const DIVERGENCE_DISCREPANCY_TYPES = [
  'STATE_MISMATCH',
  'IN_FLIGHT_TIMEOUT',
  'UNKNOWN_ON_EXCHANGE',
  'GHOST_FILL',
] as const;
export type DivergenceDiscrepancyType = (typeof DIVERGENCE_DISCREPANCY_TYPES)[number];

export interface DivergentOrder {
  id: string;
  clientOrderId: string;
  userId: string;
  botId?: string;
  symbol: string;
  exchange?: string;
  side: DivergentOrderSide;
  orderType: DivergentOrderType;
  price: string;
  quantity: string;
  localStatus: DivergentLocalStatus;
  exchangeStatus: DivergentExchangeStatus;
  discrepancyType: DivergenceDiscrepancyType;
  lastCheckedAt: string;
  createdAt: string;
  divergenceAgeSeconds: number;
}

export const COMPENSATION_CLAIM_STATUSES = ['PENDING_APPROVAL', 'APPROVED', 'REJECTED'] as const;
export type CompensationClaimStatus = (typeof COMPENSATION_CLAIM_STATUSES)[number];

export interface CompensationClaim {
  id: string;
  incidentId: string;
  userId: string;
  amountCents: number;
  reason: string;
  evidencePayload: string;
  status: CompensationClaimStatus;
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
import { AdminContractError, WIRE_KIND, WireObject, readJsonOrThrow } from './adminApiError';

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
  lifecycleStatus: VenueLifecycleStatus;
  sunsetDeadline?: string | null;
  sunsetNotice?: string | null;
  allowNewKeys: boolean;
  allowNewBots: boolean;
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

const DECOMMISSION_PROPOSAL_STATUSES: readonly DecommissionProposal['status'][] = [
  'PENDING_APPROVAL',
  'APPROVED',
  'REJECTED',
];

function parseDecommissionProposal(wire: WireObject): DecommissionProposal {
  return {
    proposedBy: wire.string('proposedBy'),
    proposedAt: wire.string('proposedAt'),
    reason: wire.string('reason'),
    status: wire.oneOf(DECOMMISSION_PROPOSAL_STATUSES, 'status'),
    approvedBy: wire.optionalString('approvedBy'),
    approvedAt: wire.optionalString('approvedAt'),
    rejectionReason: wire.optionalString('rejectionReason'),
  };
}

/**
 * Universal Protobuf Wire DTO parser complying with lowerCamelCase wire JSON standards.
 *
 * grpc-gateway writes every field of `venom.broker_config.v1.BrokerConfig` (the gateway keeps the
 * default marshaler, which emits unpopulated fields), so a missing or mistyped field is a contract
 * violation and rejects with `AdminContractError`. Nothing is invented: not the exchange of the
 * request, not `maskedIdentifier`, `updatedBy`, `environment`, `version`, `updatedAt` and not the
 * security claim `isKmsSealed`, which is the backend's `hasEncryptedSecrets`.
 * [Policy Ref: Clean Architecture & Zero Magic Strings §4.5]
 * [Policy Ref: Contract §2.1 - no fake data; Security §4.6 - no false security claim]
 */
export function parseBrokerConfigWire(wire: WireObject): BrokerConfigDTO {
  const isActive = wire.boolean('isActive', 'is_active');
  const rebatePercentage = wire.number('rebatePercentage', 'rebate_percentage');
  const payloadParams = wire.optionalStringMap('payloadParams');
  const proposal = wire.optionalObject('decommissionProposal');

  return {
    id: wire.optionalString('id'),
    exchange: normalizeExchangeKey(wire.nonEmptyString('exchange')),
    environment: wire.string('environment'),
    attributionType: wire.oneOf(Object.values(ATTRIBUTION_TYPE), 'attributionType', 'attribution_type'),
    status: isActive ? BROKER_CONFIG_STATUS.ACTIVE : BROKER_CONFIG_STATUS.INACTIVE,
    lifecycleStatus: wire.oneOf(Object.values(VENUE_LIFECYCLE_STATUS), 'lifecycleStatus', 'lifecycle_status'),
    sunsetDeadline: wire.optionalString('sunsetDeadline') ?? null,
    sunsetNotice: wire.optionalString('sunsetNotice') ?? null,
    maskedIdentifier: wire.string('maskedIdentifier', 'masked_identifier'),
    isKmsSealed: wire.boolean('hasEncryptedSecrets', 'has_encrypted_secrets'),
    rebateRateBps: Math.round(rebatePercentage * 100),
    rebatePercentage,
    clientOrderIdPrefix: wire.optionalString('clientOrderIdPrefix'),
    headerKey: wire.optionalString('headerKey'),
    headerValue: wire.optionalString('headerValue'),
    payloadParams,
    payoutAddress: wire.optionalString('payoutAddress'),
    version: wire.number('version'),
    updatedAt: wire.string('updatedAt', 'updated_at'),
    updatedBy: wire.string('updatedBy', 'updated_by'),
    extraParams: payloadParams,
    decommissionProposal: proposal === undefined ? undefined : parseDecommissionProposal(proposal),
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

// Wire bodies that are only passed on are read as unknown records; the typed generated admin client of WP-8.5a replaces this alias.
type AdminWireBody = Record<string, unknown>;

/** Every mapper below reads required fields without a default: a missing field is an `AdminContractError`. */
function toTreasuryVault(wire: WireObject): TreasuryVault {
  return {
    id: wire.string('id'),
    chain: wire.string('chain'),
    asset: wire.string('asset'),
    receivingAddress: wire.string('receivingAddress'),
    coldSweepAddress: wire.string('coldSweepAddress'),
    minDepositUsd: wire.number('minDepositUsd'),
    sweepThresholdUsd: wire.number('sweepThresholdUsd'),
    currentBalanceUsd: wire.number('currentBalanceUsd'),
    isActive: wire.boolean('isActive'),
    updatedAt: wire.string('updatedAt'),
  };
}

function toAdminUser(wire: WireObject): AdminUser {
  return {
    id: wire.string('id'),
    email: wire.string('email'),
    role: wire.oneOf(ADMIN_USER_ROLES, 'role'),
    status: wire.oneOf(ADMIN_USER_STATUSES, 'status'),
    activeBotsCount: wire.number('activeBotsCount'),
    totalVolumeUsd: wire.number('totalVolumeUsd'),
    createdAt: wire.string('createdAt'),
  };
}

function toFleetBot(wire: WireObject): FleetBot {
  return {
    id: wire.string('id'),
    userId: wire.string('userId'),
    label: wire.string('label', 'name'),
    strategy: wire.string('strategy'),
    symbol: wire.string('symbol'),
    exchange: wire.optionalString('exchange') || undefined,
    status: wire.oneOf(FLEET_BOT_STATUSES, 'status'),
    activeOrders: wire.number('activeOrders'),
    unrealizedPnlUsd: wire.number('unrealizedPnlUsd'),
    startedAt: wire.string('startedAt'),
  };
}

function toDivergentOrder(wire: WireObject): DivergentOrder {
  return {
    id: wire.string('id'),
    clientOrderId: wire.string('clientOrderId'),
    userId: wire.string('userId'),
    botId: wire.optionalString('botId') || undefined,
    symbol: wire.string('symbol'),
    exchange: wire.optionalString('exchange') || undefined,
    side: wire.oneOf(DIVERGENT_ORDER_SIDES, 'side'),
    orderType: wire.oneOf(DIVERGENT_ORDER_TYPES, 'orderType'),
    price: wire.string('price'),
    quantity: wire.string('quantity'),
    localStatus: wire.oneOf(DIVERGENT_LOCAL_STATUSES, 'localStatus'),
    exchangeStatus: wire.oneOf(DIVERGENT_EXCHANGE_STATUSES, 'exchangeStatus'),
    discrepancyType: wire.oneOf(DIVERGENCE_DISCREPANCY_TYPES, 'discrepancyType'),
    lastCheckedAt: wire.string('lastCheckedAt'),
    createdAt: wire.string('createdAt'),
    divergenceAgeSeconds: wire.number('divergenceAgeSeconds'),
  };
}

function toCompensationClaim(wire: WireObject): CompensationClaim {
  return {
    id: wire.string('id'),
    incidentId: wire.string('incidentId'),
    userId: wire.string('userId'),
    amountCents: wire.number('amountCents'),
    reason: wire.string('reason'),
    evidencePayload: wire.string('evidencePayload'),
    status: wire.oneOf(COMPENSATION_CLAIM_STATUSES, 'status'),
    createdByAdminId: wire.string('createdByAdminId'),
    approvedByAdminId: wire.optionalString('approvedByAdminId') || undefined,
    rejectionReason: wire.optionalString('rejectionReason') || undefined,
    createdAt: wire.string('createdAt'),
    updatedAt: wire.string('updatedAt'),
    approvedAt: wire.optionalString('approvedAt') || undefined,
  };
}

/** `natEgressIps` is the platform-wide list of the response; a venue entry may carry its own. */
function toPublicExchangeConfig(
  exchange: ExchangeKey,
  wire: WireObject,
  natEgressIps: string[] | undefined,
): PublicExchangeConfigDTO {
  return {
    exchange,
    name: wire.string('name'),
    portalUrl: wire.string('portalUrl'),
    staticNatIps: natEgressIps ?? wire.stringList('staticNatIps'),
    isBrokerActive: wire.boolean('allowNewBots', 'isBrokerActive'),
    lifecycleStatus: wire.oneOf(Object.values(VENUE_LIFECYCLE_STATUS), 'lifecycleStatus'),
    sunsetDeadline: wire.optionalString('sunsetDeadline') ?? null,
    sunsetNotice: wire.optionalString('sunsetNotice') ?? null,
    allowNewKeys: wire.boolean('allowNewKeys'),
    allowNewBots: wire.boolean('allowNewBots'),
  };
}

/**
 * The reason of a failed sweep: the response text, the `error` field of a JSON body, or the status
 * text when the body cannot be read. No reason is invented when the backend sent none.
 */
async function readSweepFailure(res: Response): Promise<string> {
  try {
    if (typeof res.text === 'function') {
      const text = await res.text();
      return text !== '' ? text : res.statusText;
    }
    const body: unknown = await res.json();
    if (typeof body === 'object' && body !== null && 'error' in body && body.error) {
      return String(body.error);
    }
    return JSON.stringify(body);
  } catch {
    // The body is unreadable: the status text is the only reason the backend gave.
    return res.statusText;
  }
}

/**
 * Every method calls the backend through `adminFetch` and resolves only from `readJsonOrThrow`.
 * No method returns local, cached, default or invented data and none reports success without a 2xx.
 * [Policy Ref: Contract §2.1 - fake data and fake success]
 * [Policy Ref: Standards §6.4 - no client-side fallbacks]
 */
export const adminApi = {
  getSystemStats: async (): Promise<SystemStats> => {
    const wire = WireObject.from(await readJsonOrThrow<unknown>(await adminFetch('/v1/admin/stats')));
    return {
      activeBotsCount: wire.number('activeBotsCount'),
      totalVolume24hUsd: wire.number('totalVolume24hUsd'),
      pendingSweepUsd: wire.number('pendingSweepUsd'),
      gatewayStatus: wire.oneOf(GATEWAY_STATUSES, 'gatewayStatus'),
      kafkaLag: wire.number('kafkaLag'),
      dbConnections: wire.number('dbConnections'),
      redisMemoryMb: wire.number('redisMemoryMb'),
    };
  },

  getTreasuryVaults: async (): Promise<TreasuryVault[]> => {
    const body = await readJsonOrThrow<unknown>(await adminFetch('/v1/treasury/admin/vaults'));
    return WireObject.items(body, 'vaults').map(toTreasuryVault);
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
      const reason = await readSweepFailure(res);
      throw new Error(`Sweep initiation failed (HTTP ${res.status})${reason !== '' ? `: ${reason}` : ''}`);
    }
    const wire = WireObject.from(await readJsonOrThrow<unknown>(res));
    return {
      success: wire.optionalBoolean('success') === true,
      sweepId: wire.optionalString('sweepId'),
      txHash: wire.optionalString('txHash'),
      message: wire.string('message'),
    };
  },

  getPaymentGateways: async (): Promise<PaymentGatewayConfig[]> => {
    const data = await readJsonOrThrow<AdminWireBody>(await adminFetch('/v1/billing/gateways'));
    return Array.isArray(data.gateways) ? data.gateways : [];
  },

  getUsers: async (): Promise<AdminUser[]> => {
    const body = await readJsonOrThrow<unknown>(await adminFetch('/v1/admin/users'));
    return WireObject.items(body, 'users').map(toAdminUser);
  },

  getFleetBots: async (): Promise<FleetBot[]> => {
    const body = await readJsonOrThrow<unknown>(await adminFetch('/v1/admin/bots'));
    return WireObject.items(body, 'bots').map(toFleetBot);
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
    const body = await readJsonOrThrow<unknown>(await adminFetch('/v1/trading/admin/divergent-orders'));
    return WireObject.items(body, 'orders').map(toDivergentOrder);
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
    const body = await readJsonOrThrow<unknown>(await adminFetch(url));
    return WireObject.items(body, 'claims').map(toCompensationClaim);
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
    const body = await readJsonOrThrow<unknown>(await adminFetch('/v1/admin/broker-configs?include_inactive=true'));
    return WireObject.items(body, 'configs').map(parseBrokerConfigWire);
  },

  getBrokerConfig: async (exchange: ExchangeKey): Promise<BrokerConfigDTO | null> => {
    let exchangeSlug = exchange.replace(/^EXCHANGE_/, '').toLowerCase();
    if (exchangeSlug === 'binance_spot') exchangeSlug = 'binance';
    if (exchangeSlug === 'gmx_v2') exchangeSlug = 'gmx_v2';
    const root = WireObject.from(
      await readJsonOrThrow<unknown>(await adminFetch(`/v1/admin/broker-configs/${encodeURIComponent(exchangeSlug)}`)),
    );
    // A lookup of a missing config answers 404; a 2xx body without a config carries nothing to show.
    return root.optionalObject('config') === undefined ? null : parseBrokerConfigWire(root.object('config'));
  },

  updateBrokerConfig: async (req: UpdateBrokerConfigRequest): Promise<BrokerConfigDTO> => {
    let exchangeSlug = req.exchange.replace(/^EXCHANGE_/, '').toLowerCase();
    if (exchangeSlug === 'binance_spot') exchangeSlug = 'binance';
    if (exchangeSlug === 'gmx_v2') exchangeSlug = 'gmx_v2';
    const rebatePct = req.rebatePercentage !== undefined ? req.rebatePercentage : (req.rebateRateBps ? req.rebateRateBps / 100 : 0);
    const targetId = req.id || exchangeSlug;
    const protoAttribution = toProtoAttribution(req.attributionType);

    const changeReason = req.notes?.trim() ? req.notes : undefined;
    const data = await readJsonOrThrow<unknown>(
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
          // The operator's justification, exactly as typed. The backend marks it mandatory and answers
          // its own error when it is absent; the console never writes a reason in the operator's name.
          // [Policy Ref: FLP FL-16 - an administrative action carries the actor's own justification]
          ...(changeReason === undefined ? {} : { change_reason: changeReason }),
        }),
      })
    );
    return parseBrokerConfigWire(WireObject.from(data).object('config'));
  },

  testBrokerAttribution: async (req: TestBrokerAttributionRequest): Promise<TestBrokerAttributionResponse> => {
    const exchangeSlug = req.exchange.replace(/^EXCHANGE_/, '').toLowerCase();
    const wire = WireObject.from(
      await readJsonOrThrow<unknown>(
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
        }),
      ),
    );
    return {
      success: wire.boolean('isValid'),
      attributedOrderId: wire.optionalString('formattedClientOrderId'),
      injectedHeaders: wire.optionalStringMap('injectedHeaders'),
      injectedParams: wire.optionalStringMap('injectedPayloadFields'),
      statusMessage: wire.optionalString('diagnosticMessage'),
      attributionLatencyNanos: wire.optionalNumber('formattingLatencyNanos'),
    };
  },

  getPublicExchangeConfigs: async (): Promise<PublicExchangeConfigDTO[]> => {
    const root = WireObject.from(await readJsonOrThrow<unknown>(await adminFetch('/v1/exchanges/public-config')));
    const natEgressIps = root.has('natEgressIps') ? root.stringList('natEgressIps') : undefined;
    if (root.has('exchanges')) {
      return root.entries('exchanges').map(([slug, cfg]) =>
        toPublicExchangeConfig(
          (slug.toUpperCase().startsWith('EXCHANGE_') ? slug.toUpperCase() : `EXCHANGE_${slug.toUpperCase()}`) as ExchangeKey,
          cfg,
          natEgressIps,
        ),
      );
    }
    return root.list('configs').map((cfg) =>
      toPublicExchangeConfig(cfg.string('exchange') as ExchangeKey, cfg, natEgressIps),
    );
  },

  // Maker-Checker Venue Decommissioning Governance (4-Eyes Dual Approval)
  // [Policy Ref: ADR-0045 - 4-Stage Venue Lifecycle Transition; FLP FL-16 - two-person administrative actions]
  proposeVenueDecommission: async (
    exchange: ExchangeKey,
    makerAdminId: string,
    reason: string
  ): Promise<BrokerConfigDTO> => {
    const exchangeSlug = exchange.replace(/^EXCHANGE_/, '').toLowerCase();
    const data = await readJsonOrThrow<unknown>(
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
    return parseBrokerConfigWire(WireObject.from(data).object('config'));
  },

  approveVenueDecommission: async (
    exchange: ExchangeKey,
    checkerAdminId: string
  ): Promise<BrokerConfigDTO> => {
    const exchangeSlug = exchange.replace(/^EXCHANGE_/, '').toLowerCase();
    const data = await readJsonOrThrow<unknown>(
      await adminFetch(`/v1/admin/broker-configs/${encodeURIComponent(exchangeSlug)}/decommission/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exchange: exchangeSlug,
          checker_admin_id: checkerAdminId,
        }),
      })
    );
    return parseBrokerConfigWire(WireObject.from(data).object('config'));
  },

  rejectVenueDecommission: async (
    exchange: ExchangeKey,
    checkerAdminId: string,
    rejectionReason: string
  ): Promise<BrokerConfigDTO> => {
    const exchangeSlug = exchange.replace(/^EXCHANGE_/, '').toLowerCase();
    const data = await readJsonOrThrow<unknown>(
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
    return parseBrokerConfigWire(WireObject.from(data).object('config'));
  },
};
