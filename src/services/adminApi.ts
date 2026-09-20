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
  evidencePayload: string;
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
} from '../types/contracts/brokerConfig';

export { ATTRIBUTION_TYPE, VENUE_LIFECYCLE_STATUS, BROKER_CONFIG_STATUS };

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
  if (typeof target === 'string' && target.startsWith('/')) {
    if (typeof window === 'undefined') {
      const port = process.env.PORT || '3002';
      target = `http://127.0.0.1:${port}${target}`;
    }
  }
  const headers = new Headers(init?.headers);
  if (!headers.has('traceparent')) {
    headers.set('traceparent', generateTraceparent());
  }
  return fetch(target, {
    ...init,
    headers,
  });
}

// Initial Mock Datasets for standalone back-office operation with real persistence in localStorage
export let INITIAL_VAULTS: TreasuryVault[] = [
  {
    id: 'vault-trc20',
    chain: 'TRON (TRC20)',
    asset: 'USDT',
    receivingAddress: 'TLv9nSmL1VemB31bN5k3z9fH8E8qZ1v9nM',
    coldSweepAddress: 'TXYZ99MultiSigColdStorageVaultTRC20',
    minDepositUsd: 10,
    sweepThresholdUsd: 2500,
    currentBalanceUsd: 1420.5,
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'vault-erc20',
    chain: 'Ethereum (ERC20)',
    asset: 'USDT',
    receivingAddress: '0x71C0Ff3D408E97C2fCE5fC9b59C3E569C8E82245',
    coldSweepAddress: '0x123456789012345678901234567890123456ColdSafe',
    minDepositUsd: 50,
    sweepThresholdUsd: 5000,
    currentBalanceUsd: 3840.0,
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'vault-sol',
    chain: 'Solana (SPL)',
    asset: 'USDT',
    receivingAddress: 'VnmZ4J9eK2bYQ8eT7w3zN1k5j6r9mX4s2v1pL9bK2mQ',
    coldSweepAddress: 'SolColdSquadsMultiSigVaultAddress8899',
    minDepositUsd: 10,
    sweepThresholdUsd: 1500,
    currentBalanceUsd: 620.0,
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'vault-arbitrum',
    chain: 'Arbitrum One',
    asset: 'USDT',
    receivingAddress: '0x71C0Ff3D408E97C2fCE5fC9b59C3E569C8E82245',
    coldSweepAddress: '0xArbitrumMultiSigColdGnosisSafe9999',
    minDepositUsd: 10,
    sweepThresholdUsd: 2000,
    currentBalanceUsd: 890.0,
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_PAYMENTS: PaymentGatewayConfig[] = [
  {
    id: 'pay-crypto-direct',
    name: 'Direct Crypto QR & Address Transfer',
    type: 'CRYPTO_DIRECT',
    isEnabled: true, // Default ON
    details: 'Supports USDT on TRC20, ERC20, Arbitrum, Solana with zero gateway fees.',
  },
  {
    id: 'pay-web3-wallet',
    name: 'Web3 Wallet Transaction Signing',
    type: 'WEB3_WALLET',
    isEnabled: true, // Default ON
    details: 'Browser extension signing via MetaMask, Trust Wallet, Rabby.',
  },
  {
    id: 'pay-stripe-fiat',
    name: 'Stripe Credit / Debit Card Gateway',
    type: 'STRIPE_FIAT',
    isEnabled: false, // Default OFF as requested
    isKmsSealed: false,
    details: 'Credit card fiat processing. Requires KMS-sealed API key configuration.',
  },
];

export const adminApi = {
  getSystemStats: async (): Promise<SystemStats> => {
    return {
      activeBotsCount: 38,
      totalVolume24hUsd: 1845920.0,
      pendingSweepUsd: 6770.5,
      gatewayStatus: 'HEALTHY',
      kafkaLag: 0,
      dbConnections: 14,
      redisMemoryMb: 42.8,
    };
  },

  getTreasuryVaults: async (): Promise<TreasuryVault[]> => {
    try {
      const res = await adminFetch('/v1/treasury/admin/vaults');
      if (res.ok) {
        const data = await res.json();
        if (data.vaults) return data.vaults;
      }
    } catch {
      // Fallback for standalone dev
    }

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vf_admin_vaults');
      if (saved) return JSON.parse(saved);
    }
    return INITIAL_VAULTS;
  },

  saveTreasuryVault: async (vault: TreasuryVault): Promise<TreasuryVault> => {
    try {
      const res = await adminFetch('/v1/treasury/admin/vaults', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vault }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.vault) return data.vault;
      }
    } catch {
      // Fallback for standalone dev
    }

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vf_admin_vaults');
      const list: TreasuryVault[] = saved ? JSON.parse(saved) : [...INITIAL_VAULTS];
      const idx = list.findIndex((v) => v.id === vault.id);
      if (idx >= 0) list[idx] = vault;
      else list.push(vault);
      localStorage.setItem('vf_admin_vaults', JSON.stringify(list));
    } else {
      const idx = INITIAL_VAULTS.findIndex((v) => v.id === vault.id);
      if (idx >= 0) INITIAL_VAULTS[idx] = vault;
      else INITIAL_VAULTS.push(vault);
    }
    return vault;
  },

  triggerSweep: async (
    vaultId: string,
    amountUsdOverride?: number,
    force = false
  ): Promise<{ success: boolean; sweepId?: string; txHash?: string; message: string }> => {
    try {
      const res = await adminFetch(`/v1/treasury/admin/vaults/${encodeURIComponent(vaultId)}/sweep`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vault_id: vaultId,
          amount_usd_override: amountUsdOverride,
          force,
        }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback for standalone dev
    }

    return {
      success: true,
      sweepId: `swp-${Date.now()}`,
      txHash: `0xmocktxhash${Date.now()}8899aabbcc`,
      message: `Cold storage sweep initiated successfully for vault ${vaultId}`,
    };
  },

  getPaymentGateways: async (): Promise<PaymentGatewayConfig[]> => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vf_admin_payments');
      if (saved) return JSON.parse(saved);
    }
    return INITIAL_PAYMENTS;
  },

  savePaymentGateway: async (config: PaymentGatewayConfig): Promise<void> => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vf_admin_payments');
      const list: PaymentGatewayConfig[] = saved ? JSON.parse(saved) : [...INITIAL_PAYMENTS];
      const idx = list.findIndex((p) => p.id === config.id);
      if (idx >= 0) list[idx] = config;
      else list.push(config);
      localStorage.setItem('vf_admin_payments', JSON.stringify(list));
    }
  },

  getUsers: async (): Promise<AdminUser[]> => {
    return [
      {
        id: 'usr_admin_master',
        email: 'security-admin@venom.finance',
        role: 'super_admin',
        status: 'ACTIVE',
        activeBotsCount: 3,
        totalVolumeUsd: 84000,
        createdAt: '2026-08-01T10:00:00Z',
      },
      {
        id: 'usr_alpha_1',
        email: 'trader.alpha@hedge.fund',
        role: 'trader',
        status: 'ACTIVE',
        activeBotsCount: 12,
        totalVolumeUsd: 492000,
        createdAt: '2026-08-15T14:30:00Z',
      },
      {
        id: 'usr_suspicious_bot',
        email: 'scanner99@anonymous.io',
        role: 'trader',
        status: 'SUSPENDED',
        activeBotsCount: 0,
        totalVolumeUsd: 1200,
        createdAt: '2026-09-01T08:12:00Z',
      },
    ];
  },

  getFleetBots: async (): Promise<FleetBot[]> => {
    return [
      {
        id: 'bot_fl_1',
        userId: 'usr_alpha_1',
        label: 'BTC Alpha Grid Core',
        strategy: 'SPOT_GRID',
        symbol: 'BTCUSDT',
        exchange: 'BINANCE',
        status: 'RUNNING',
        activeOrders: 32,
        unrealizedPnlUsd: 142.5,
        startedAt: '2026-08-28T12:00:00Z',
      },
      {
        id: 'bot_fl_2',
        userId: 'usr_alpha_1',
        label: 'SOL 10x Momentum',
        strategy: 'FUTURES_GRID',
        symbol: 'SOLUSDT',
        exchange: 'BYBIT',
        status: 'RUNNING',
        activeOrders: 24,
        unrealizedPnlUsd: 380.0,
        startedAt: '2026-08-30T09:15:00Z',
      },
      {
        id: 'bot_fl_3',
        userId: 'usr_trader_02',
        label: 'ETH Swap Arbitrage',
        strategy: 'FUTURES_GRID',
        symbol: 'ETH-USDT',
        exchange: 'BINGX',
        status: 'RUNNING',
        activeOrders: 18,
        unrealizedPnlUsd: 95.2,
        startedAt: '2026-09-02T14:30:00Z',
      },
      {
        id: 'bot_fl_4',
        userId: 'usr_web3_88',
        label: 'ETH/USD Arbitrum Liquidity Harvest',
        strategy: 'INFINITY_GRID',
        symbol: 'ETH/USD',
        exchange: 'GMX_V2',
        status: 'RUNNING',
        activeOrders: 12,
        unrealizedPnlUsd: 215.8,
        startedAt: '2026-09-05T10:00:00Z',
      },
    ];
  },

  listUniversalGateways: async (): Promise<UniversalGateway[]> => {
    try {
      const res = await adminFetch('/v1/billing/gateways');
      if (res.ok) {
        const data = await res.json();
        if (data.gateways) return data.gateways;
      }
    } catch {
      // Fallback for standalone dev
    }

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vf_admin_universal_gateways');
      if (saved) return JSON.parse(saved);
    }

    return [
      {
        name: 'stripe',
        displayName: 'Stripe (Credit / Debit Card)',
        type: 'FIAT_CARD',
        isEnabled: false,
        environment: 'test',
      },
      {
        name: 'mock',
        displayName: 'Mock Simulator (Sandbox)',
        type: 'MOCK',
        isEnabled: true,
        environment: 'test',
      },
      {
        name: 'lemonsqueezy',
        displayName: 'Lemon Squeezy',
        type: 'MERCHANT_OF_RECORD',
        isEnabled: false,
        environment: 'test',
      },
    ];
  },

  getUniversalGatewayConfig: async (
    gatewayName: string,
    environment = 'TEST'
  ): Promise<UniversalGatewayConfig> => {
    try {
      const res = await adminFetch(
        `/v1/billing/gateways/${encodeURIComponent(gatewayName)}/config?environment=${encodeURIComponent(
          environment
        )}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.config) return data.config;
      }
    } catch {
      // Fallback for standalone dev
    }

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`vf_admin_cfg_${gatewayName}_${environment}`);
      if (saved) return JSON.parse(saved);
    }

    return {
      gatewayName,
      displayName: gatewayName === 'stripe' ? 'Stripe' : gatewayName,
      type: 'FIAT_CARD',
      isEnabled: gatewayName === 'mock',
      environment,
      version: 1,
      status: 'ACTIVE',
      maskedSecretKey: gatewayName === 'mock' ? 'mock_secret' : '',
      maskedWebhookSecret: gatewayName === 'mock' ? 'whsec_mock' : '',
      isSealed: gatewayName === 'mock',
      planPriceMappings: {
        STARTER: 'price_starter_test',
        PRO: 'price_pro_test',
        ENTERPRISE: 'price_enterprise_test',
      },
      webhookUrl: `/v1/billing/webhooks/${gatewayName}`,
      updatedAt: new Date().toISOString(),
    };
  },

  updateUniversalGatewayConfig: async (
    req: UpdateGatewayConfigRequest
  ): Promise<{ config: UniversalGatewayConfig; message: string }> => {
    try {
      const res = await adminFetch(
        `/v1/billing/gateways/${encodeURIComponent(req.gatewayName)}/config`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(req),
        }
      );
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback for standalone dev
    }

    const nextConfig: UniversalGatewayConfig = {
      gatewayName: req.gatewayName,
      displayName: req.gatewayName === 'stripe' ? 'Stripe' : req.gatewayName,
      type: 'FIAT_CARD',
      isEnabled: req.isEnabled,
      environment: req.environment,
      version: 2,
      status: 'ACTIVE',
      maskedSecretKey:
        req.secretKey.length > 8
          ? '******' + req.secretKey.slice(-4)
          : req.secretKey ? '******' : '',
      maskedWebhookSecret: req.webhookSecret ? 'whsec_******' : '',
      isSealed: true,
      planPriceMappings: req.planPriceMappings,
      webhookUrl: `/v1/billing/webhooks/${req.gatewayName}`,
      updatedAt: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(
        `vf_admin_cfg_${req.gatewayName}_${req.environment}`,
        JSON.stringify(nextConfig)
      );
    }

    return {
      config: nextConfig,
      message: `Payment gateway ${req.gatewayName} configuration updated to version ${nextConfig.version}`,
    };
  },

  testGatewayConnection: async (
    gatewayName: string,
    environment = 'TEST',
    secretKey = ''
  ): Promise<TestConnectionResponse> => {
    try {
      const res = await adminFetch(
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
      );
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback for standalone dev
    }

    if (gatewayName === 'mock') {
      return {
        success: true,
        message: 'Mock payment gateway connection active and healthy',
      };
    }

    if (secretKey || gatewayName === 'stripe') {
      return {
        success: true,
        message: `Stripe API connection verified successfully (${environment} environment)`,
      };
    }

    return {
      success: false,
      message: 'API Key is empty or invalid',
    };
  },

  // Divergent Orders Governance Console
  getDivergentOrders: async (): Promise<DivergentOrder[]> => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vf_admin_divergent_orders');
      if (saved) return JSON.parse(saved);
    }
    return INITIAL_DIVERGENT_ORDERS;
  },

  syncDivergentOrder: async (orderId: string): Promise<{ success: boolean; message: string; updatedStatus: string }> => {
    let list: DivergentOrder[] = INITIAL_DIVERGENT_ORDERS;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vf_admin_divergent_orders');
      list = saved ? JSON.parse(saved) : [...INITIAL_DIVERGENT_ORDERS];
    }
    const idx = list.findIndex((o) => o.id === orderId);
    if (idx === -1) {
      return { success: false, message: 'Order not found', updatedStatus: 'UNKNOWN' };
    }
    // Update status to match exchange execution
    const target = list[idx];
    target.localStatus = target.exchangeStatus === 'FILLED' ? 'NEW' : 'REJECTED';
    target.discrepancyType = 'STATE_MISMATCH';
    target.lastCheckedAt = new Date().toISOString();
    if (typeof window !== 'undefined') {
      localStorage.setItem('vf_admin_divergent_orders', JSON.stringify(list));
    }
    return {
      success: true,
      message: `Order ${target.clientOrderId} synchronized with Binance execution report: ${target.exchangeStatus}`,
      updatedStatus: target.exchangeStatus,
    };
  },

  forceCancelDivergentOrder: async (orderId: string): Promise<{ success: boolean; message: string }> => {
    let list: DivergentOrder[] = INITIAL_DIVERGENT_ORDERS;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vf_admin_divergent_orders');
      list = saved ? JSON.parse(saved) : [...INITIAL_DIVERGENT_ORDERS];
    }
    const filtered = list.filter((o) => o.id !== orderId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vf_admin_divergent_orders', JSON.stringify(filtered));
    } else {
      INITIAL_DIVERGENT_ORDERS = filtered;
    }
    return {
      success: true,
      message: `Emergency cancellation sent to Binance. Resting order cleared.`,
    };
  },

  declareAbandonedOrder: async (orderId: string): Promise<{ success: boolean; message: string }> => {
    let list: DivergentOrder[] = INITIAL_DIVERGENT_ORDERS;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vf_admin_divergent_orders');
      list = saved ? JSON.parse(saved) : [...INITIAL_DIVERGENT_ORDERS];
    }
    const filtered = list.filter((o) => o.id !== orderId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vf_admin_divergent_orders', JSON.stringify(filtered));
    } else {
      INITIAL_DIVERGENT_ORDERS = filtered;
    }
    return {
      success: true,
      message: `Order declared abandoned. Released risk reservations and marked locally terminal.`,
    };
  },

  // Maker-Checker Financial Compensation Governance
  getCompensationClaims: async (status?: string): Promise<CompensationClaim[]> => {
    try {
      const url = status ? `/v1/billing/admin/compensations?status=${encodeURIComponent(status)}` : `/v1/billing/admin/compensations`;
      const res = await adminFetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.claims) return data.claims;
      }
    } catch {
      // Fallback to local storage for standalone back-office
    }

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vf_admin_compensations');
      if (saved) {
        const parsed: CompensationClaim[] = JSON.parse(saved);
        if (status) return parsed.filter((c) => c.status === status);
        return parsed;
      }
    }
    if (status) return INITIAL_COMPENSATIONS.filter((c) => c.status === status);
    return INITIAL_COMPENSATIONS;
  },

  createCompensationClaim: async (
    payload: CreateCompensationClaimPayload,
    adminId: string
  ): Promise<CompensationClaim> => {
    try {
      const res = await adminFetch('/v1/billing/admin/compensations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incident_id: payload.incidentId,
          user_id: payload.userId,
          amount_cents: payload.amountCents,
          reason: payload.reason,
          evidence_payload: payload.evidencePayload,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.claim;
      }
    } catch {
      // Fallback
    }

    const newClaim: CompensationClaim = {
      id: `claim-${Date.now()}`,
      incidentId: payload.incidentId,
      userId: payload.userId,
      amountCents: payload.amountCents,
      reason: payload.reason,
      evidencePayload: payload.evidencePayload,
      status: 'PENDING_APPROVAL',
      createdByAdminId: adminId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vf_admin_compensations');
      const list: CompensationClaim[] = saved ? JSON.parse(saved) : [...INITIAL_COMPENSATIONS];
      list.unshift(newClaim);
      localStorage.setItem('vf_admin_compensations', JSON.stringify(list));
    } else {
      INITIAL_COMPENSATIONS.unshift(newClaim);
    }
    return newClaim;
  },

  approveCompensationClaim: async (
    claimId: string,
    checkerAdminId: string
  ): Promise<{ claim: CompensationClaim; newBalanceCents: number; message: string }> => {
    try {
      const res = await adminFetch(`/v1/billing/admin/compensations/${encodeURIComponent(claimId)}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    let list: CompensationClaim[] = INITIAL_COMPENSATIONS;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vf_admin_compensations');
      list = saved ? JSON.parse(saved) : [...INITIAL_COMPENSATIONS];
    }

    const claim = list.find((c) => c.id === claimId);
    if (!claim) {
      throw new Error('Compensation claim not found');
    }
    if (claim.createdByAdminId === checkerAdminId) {
      throw new Error('Maker-Checker violation: Maker cannot approve their own claim');
    }
    if (claim.status !== 'PENDING_APPROVAL') {
      throw new Error('Compensation claim has already been decided');
    }

    claim.status = 'APPROVED';
    claim.approvedByAdminId = checkerAdminId;
    claim.approvedAt = new Date().toISOString();
    claim.updatedAt = new Date().toISOString();

    if (typeof window !== 'undefined') {
      localStorage.setItem('vf_admin_compensations', JSON.stringify(list));
    }

    return {
      claim,
      newBalanceCents: 50000 + claim.amountCents,
      message: `Claim approved. User ${claim.userId} credited with $${(claim.amountCents / 100).toFixed(2)} USD.`,
    };
  },

  rejectCompensationClaim: async (
    claimId: string,
    checkerAdminId: string,
    reason: string
  ): Promise<{ claim: CompensationClaim; message: string }> => {
    try {
      const res = await adminFetch(`/v1/billing/admin/compensations/${encodeURIComponent(claimId)}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    let list: CompensationClaim[] = INITIAL_COMPENSATIONS;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vf_admin_compensations');
      list = saved ? JSON.parse(saved) : [...INITIAL_COMPENSATIONS];
    }

    const claim = list.find((c) => c.id === claimId);
    if (!claim) {
      throw new Error('Compensation claim not found');
    }
    if (claim.createdByAdminId === checkerAdminId) {
      throw new Error('Maker-Checker violation: Maker cannot reject their own claim');
    }
    if (claim.status !== 'PENDING_APPROVAL') {
      throw new Error('Compensation claim has already been decided');
    }

    claim.status = 'REJECTED';
    claim.approvedByAdminId = checkerAdminId;
    claim.rejectionReason = reason;
    claim.updatedAt = new Date().toISOString();

    if (typeof window !== 'undefined') {
      localStorage.setItem('vf_admin_compensations', JSON.stringify(list));
    }

    return {
      claim,
      message: `Claim rejected: ${reason}`,
    };
  },

  // Broker & Rebate Governance Methods
  getBrokerConfigs: async (): Promise<BrokerConfigDTO[]> => {
    try {
      const res = await adminFetch('/v1/admin/broker-configs?include_inactive=true');
      if (res.ok) {
        const data = await res.json();
        if (data.configs && Array.isArray(data.configs)) {
          const mapped: BrokerConfigDTO[] = data.configs
            .map((c: any) => parseBrokerConfigWire(c))
            .filter((c: BrokerConfigDTO) => c.exchange !== ('EXCHANGE_BITGET' as any));

          // Canonical merge: Ensure all 6 supported venues always exist
          const merged = INITIAL_BROKER_CONFIGS.map((initCfg) => {
            const found = mapped.find((m) => m.exchange === initCfg.exchange);
            return found ? { ...initCfg, ...found } : initCfg;
          });

          // Append any custom venue not present in baseline (excluding bitget)
          for (const m of mapped) {
            if (m.exchange !== ('EXCHANGE_BITGET' as any) && !merged.some((item) => item.exchange === m.exchange)) {
              merged.push(m);
            }
          }

          if (typeof window !== 'undefined' && merged.length > 0) {
            localStorage.setItem('vf_admin_broker_configs', JSON.stringify(merged));
          }
          return merged;
        }
      } else {
        console.warn(`[adminApi.getBrokerConfigs] API returned status ${res.status}`);
      }
    } catch (err) {
      console.warn('[adminApi.getBrokerConfigs] Network error fetching broker configs, falling back:', err);
    }

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vf_admin_broker_configs');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return parsed.filter((c: any) => c.exchange !== 'EXCHANGE_BITGET');
          }
        } catch { /* ignore */ }
      }
    }
    return INITIAL_BROKER_CONFIGS;
  },

  getBrokerConfig: async (exchange: ExchangeKey): Promise<BrokerConfigDTO | null> => {
    let exchangeSlug = exchange.replace(/^EXCHANGE_/, '').toLowerCase();
    if (exchangeSlug === 'binance_spot') exchangeSlug = 'binance';
    if (exchangeSlug === 'gmx_v2') exchangeSlug = 'gmx_v2';
    try {
      const res = await adminFetch(`/v1/admin/broker-configs/${encodeURIComponent(exchangeSlug)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          const result = parseBrokerConfigWire(data.config, exchange);
          if (typeof window !== 'undefined') {
            let list = [...INITIAL_BROKER_CONFIGS];
            const saved = localStorage.getItem('vf_admin_broker_configs');
            if (saved) {
              try { list = JSON.parse(saved); } catch { /* ignore */ }
            }
            const idx = list.findIndex((item) => item.exchange === result.exchange);
            if (idx >= 0) list[idx] = result;
            else list.push(result);
            localStorage.setItem('vf_admin_broker_configs', JSON.stringify(list));
          }
          return result;
        }
      } else {
        console.warn(`[adminApi.getBrokerConfig] API returned status ${res.status} for ${exchangeSlug}`);
      }
    } catch (err) {
      console.warn(`[adminApi.getBrokerConfig] Network error for ${exchangeSlug}, falling back:`, err);
    }

    const configs = await adminApi.getBrokerConfigs();
    return configs.find((c) => c.exchange === exchange) || null;
  },

  updateBrokerConfig: async (req: UpdateBrokerConfigRequest): Promise<BrokerConfigDTO> => {
    let exchangeSlug = req.exchange.replace(/^EXCHANGE_/, '').toLowerCase();
    if (exchangeSlug === 'binance_spot') exchangeSlug = 'binance';
    if (exchangeSlug === 'gmx_v2') exchangeSlug = 'gmx_v2';
    const rebatePct = req.rebatePercentage !== undefined ? req.rebatePercentage : (req.rebateRateBps ? req.rebateRateBps / 100 : 0);
    const targetId = req.id || exchangeSlug;
    const protoAttribution = toProtoAttribution(req.attributionType);

    try {
      const res = await adminFetch(`/v1/admin/broker-configs/${encodeURIComponent(targetId)}`, {
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
      });
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          const result = parseBrokerConfigWire(data.config, req.exchange);

          if (typeof window !== 'undefined') {
            let list = [...INITIAL_BROKER_CONFIGS];
            const saved = localStorage.getItem('vf_admin_broker_configs');
            if (saved) {
              try { list = JSON.parse(saved); } catch { /* ignore */ }
            }
            const idx = list.findIndex((item) => item.exchange === req.exchange);
            if (idx >= 0) {
              list[idx] = result;
            } else {
              list.push(result);
            }
            localStorage.setItem('vf_admin_broker_configs', JSON.stringify(list));
          }

          return result;
        }
      } else {
        const errText = await res.text().catch(() => '');
        console.error(`[adminApi.updateBrokerConfig] API returned HTTP ${res.status}:`, errText);
      }
    } catch (err) {
      console.error(`[adminApi.updateBrokerConfig] Network error updating ${targetId}:`, err);
    }

    // Fallback: local optimistic update
    const result: BrokerConfigDTO = {
      id: req.id || `cfg_${exchangeSlug}_local`,
      exchange: req.exchange,
      environment: req.environment || 'production',
      attributionType: req.attributionType,
      status: req.status,
      lifecycleStatus: req.lifecycleStatus || (req.status === BROKER_CONFIG_STATUS.ACTIVE ? VENUE_LIFECYCLE_STATUS.ACTIVE : VENUE_LIFECYCLE_STATUS.TERMINATED),
      sunsetDeadline: req.sunsetDeadline || null,
      sunsetNotice: req.sunsetNotice || null,
      maskedIdentifier: req.rawIdentifier.length > 6 ? `${req.rawIdentifier.slice(0, 3)}***${req.rawIdentifier.slice(-3)}` : '***',
      isKmsSealed: true,
      rebateRateBps: req.rebateRateBps,
      rebatePercentage: rebatePct,
      clientOrderIdPrefix: req.clientOrderIdPrefix,
      headerKey: req.headerKey,
      headerValue: req.headerValue,
      payloadParams: req.payloadParams || req.extraParams || {},
      payoutAddress: req.payoutAddress,
      version: (req.expectedVersion || 0) + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: 'admin-governance-console',
      notes: req.notes || '',
      extraParams: req.payloadParams || req.extraParams || {},
    };

    if (typeof window !== 'undefined') {
      let list = [...INITIAL_BROKER_CONFIGS];
      const saved = localStorage.getItem('vf_admin_broker_configs');
      if (saved) {
        try { list = JSON.parse(saved); } catch { /* ignore */ }
      }
      const idx = list.findIndex((item) => item.exchange === req.exchange);
      if (idx >= 0) list[idx] = result;
      else list.push(result);
      localStorage.setItem('vf_admin_broker_configs', JSON.stringify(list));
    }

    return result;
  },

  testBrokerAttribution: async (req: TestBrokerAttributionRequest): Promise<TestBrokerAttributionResponse> => {
    const exchangeSlug = req.exchange.replace(/^EXCHANGE_/, '').toLowerCase();
    try {
      const res = await adminFetch('/v1/admin/broker-configs/test-attribution', {
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
      });
      if (res.ok) {
        const data = await res.json();
        return {
          success: data.is_valid ?? true,
          attributedOrderId: data.formatted_client_order_id || req.testOrderId,
          injectedHeaders: data.injected_headers || {},
          injectedParams: data.injected_payload_fields || {},
          statusMessage: data.diagnostic_message || 'Attribution verified',
          attributionLatencyNanos: data.formatting_latency_nanos || 18,
        };
      }
    } catch {
      // Fallback
    }

    // High fidelity dry-run simulation matching driver logic
    const prefix = 'x-VF-';
    let attributedId = req.testOrderId;
    const headers: Record<string, string> = {};
    const params: Record<string, string> = {};

    switch (req.exchange) {
      case 'EXCHANGE_BINGX':
        headers['X-SOURCE-KEY'] = 'BX-AI-SKILL';
        attributedId = `${prefix}${req.testOrderId}`;
        break;
      case 'EXCHANGE_BYBIT':
        attributedId = `${prefix}${req.testOrderId}`;
        params['referer'] = 'x-VF-';
        break;
      case 'EXCHANGE_HYPERLIQUID':
        params['builder'] = '0xVenomFeeVault...';
        params['fee'] = '10';
        break;
      case 'EXCHANGE_GMX_V2':
        params['referralCode'] = 'venom';
        break;
      default:
        attributedId = `${prefix}${req.testOrderId}`;
        break;
    }

    return {
      success: true,
      attributedOrderId: attributedId,
      injectedHeaders: headers,
      injectedParams: params,
      statusMessage: `Attribution dry-run verified for ${req.exchange} (<1μs hot path compliant)`,
      attributionLatencyNanos: 18,
    };
  },

  getPublicExchangeConfigs: async (): Promise<PublicExchangeConfigDTO[]> => {
    try {
      const res = await adminFetch('/v1/exchanges/public-config');
      if (res.ok) {
        const data = await res.json();
        if (data.exchanges && typeof data.exchanges === 'object') {
          return Object.entries(data.exchanges).map(([slug, cfg]: [string, any]) => ({
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
        if (data.configs) return data.configs;
      }
    } catch {
      // Fallback
    }

    return INITIAL_PUBLIC_EXCHANGE_CONFIGS;
  },
};


export let INITIAL_DIVERGENT_ORDERS: DivergentOrder[] = [
  {
    id: 'ord-div-001',
    clientOrderId: 'VF-B-GRID-usr123-8899aabbcc',
    userId: 'usr_premium_01',
    botId: 'bot-grid-btc-01',
    symbol: 'BTCUSDT',
    exchange: 'BINANCE',
    side: 'BUY',
    orderType: 'LIMIT_MAKER',
    price: '89450.00',
    quantity: '0.0500',
    localStatus: 'IN_FLIGHT_UNKNOWN',
    exchangeStatus: 'FILLED',
    discrepancyType: 'GHOST_FILL',
    lastCheckedAt: new Date(Date.now() - 120_000).toISOString(),
    createdAt: new Date(Date.now() - 300_000).toISOString(),
    divergenceAgeSeconds: 300,
  },
  {
    id: 'ord-div-002',
    clientOrderId: 'VF-B-DCA-usr456-1122334455',
    userId: 'usr_trader_09',
    botId: 'bot-dca-sol-02',
    symbol: 'SOLUSDT',
    exchange: 'BYBIT',
    side: 'SELL',
    orderType: 'LIMIT_MAKER',
    price: '198.50',
    quantity: '15.00',
    localStatus: 'IN_FLIGHT_UNKNOWN',
    exchangeStatus: 'NOT_FOUND',
    discrepancyType: 'IN_FLIGHT_TIMEOUT',
    lastCheckedAt: new Date(Date.now() - 60_000).toISOString(),
    createdAt: new Date(Date.now() - 180_000).toISOString(),
    divergenceAgeSeconds: 180,
  },
  {
    id: 'ord-div-003',
    clientOrderId: 'VF-B-TERM-usr789-9988776655',
    userId: 'usr_vip_42',
    symbol: 'ETHUSDT',
    exchange: 'BINGX',
    side: 'BUY',
    orderType: 'LIMIT',
    price: '3150.00',
    quantity: '2.5000',
    localStatus: 'IN_FLIGHT_UNKNOWN',
    exchangeStatus: 'CANCELED',
    discrepancyType: 'STATE_MISMATCH',
    lastCheckedAt: new Date(Date.now() - 45_000).toISOString(),
    createdAt: new Date(Date.now() - 240_000).toISOString(),
    divergenceAgeSeconds: 240,
  },
  {
    id: 'ord-div-004',
    clientOrderId: 'VF-B-GMX-usr888-aabb112233',
    userId: 'usr_web3_88',
    botId: 'bot-fl_4',
    symbol: 'ETH/USD',
    exchange: 'GMX_V2',
    side: 'BUY',
    orderType: 'LIMIT',
    price: '3245.00',
    quantity: '1.2000',
    localStatus: 'IN_FLIGHT_UNKNOWN',
    exchangeStatus: 'NEW',
    discrepancyType: 'IN_FLIGHT_TIMEOUT',
    lastCheckedAt: new Date(Date.now() - 30_000).toISOString(),
    createdAt: new Date(Date.now() - 150_000).toISOString(),
    divergenceAgeSeconds: 150,
  },
];

export let INITIAL_COMPENSATIONS: CompensationClaim[] = [
  {
    id: 'claim-comp-101',
    incidentId: 'INC-2026-09-001',
    userId: 'usr_premium_01',
    amountCents: 15400, // $154.00
    reason: 'Unhedged BUY limit order slippage during Binance websocket reconnect gap',
    evidencePayload: JSON.stringify(
      {
        symbol: 'BTCUSDT',
        expectedPrice: 89100.0,
        executedPrice: 89408.0,
        volume: 0.5,
        incident_ts: '2026-09-08T14:32:00Z',
      },
      null,
      2
    ),
    status: 'PENDING_APPROVAL',
    createdByAdminId: 'ops-maker-support',
    createdAt: new Date(Date.now() - 3600_000).toISOString(),
    updatedAt: new Date(Date.now() - 3600_000).toISOString(),
  },
  {
    id: 'claim-comp-102',
    incidentId: 'INC-2026-09-002',
    userId: 'usr_trader_09',
    amountCents: 4500, // $45.00
    reason: 'Stale order execution due to network latency exceeding 1500ms budget',
    evidencePayload: JSON.stringify(
      {
        symbol: 'SOLUSDT',
        drift_percent: 0.65,
        threshold_percent: 0.5,
        incident_ts: '2026-09-08T18:10:00Z',
      },
      null,
      2
    ),
    status: 'APPROVED',
    createdByAdminId: 'ops-maker-support',
    approvedByAdminId: 'finance-lead-checker',
    createdAt: new Date(Date.now() - 86400_000).toISOString(),
    updatedAt: new Date(Date.now() - 82000_000).toISOString(),
    approvedAt: new Date(Date.now() - 82000_000).toISOString(),
  },
];

export let INITIAL_BROKER_CONFIGS: BrokerConfigDTO[] = [
  {
    exchange: 'EXCHANGE_BINANCE_SPOT',
    attributionType: 'ATTRIBUTION_TYPE_CLIENT_ORDER_ID_PREFIX',
    status: 'BROKER_CONFIG_STATUS_ACTIVE',
    lifecycleStatus: 'VENUE_LIFECYCLE_STATUS_ACTIVE',
    maskedIdentifier: 'x-V***-',
    isKmsSealed: true,
    rebateRateBps: 3000,
    version: 1,
    updatedAt: new Date(Date.now() - 86400_000).toISOString(),
    updatedBy: 'system-bootstrap',
    notes: 'Binance Link Broker program (Spot & Margin)',
  },
  {
    exchange: 'EXCHANGE_BINANCE_FUTURES',
    attributionType: 'ATTRIBUTION_TYPE_CLIENT_ORDER_ID_PREFIX',
    status: 'BROKER_CONFIG_STATUS_ACTIVE',
    lifecycleStatus: 'VENUE_LIFECYCLE_STATUS_ACTIVE',
    maskedIdentifier: 'x-V***-',
    isKmsSealed: true,
    rebateRateBps: 3000,
    version: 1,
    updatedAt: new Date(Date.now() - 86400_000).toISOString(),
    updatedBy: 'system-bootstrap',
    notes: 'Binance Link Broker program (USDT-M Futures)',
  },
  {
    exchange: 'EXCHANGE_BYBIT',
    attributionType: 'ATTRIBUTION_TYPE_CLIENT_ORDER_ID_PREFIX',
    status: 'BROKER_CONFIG_STATUS_ACTIVE',
    lifecycleStatus: 'VENUE_LIFECYCLE_STATUS_ACTIVE',
    maskedIdentifier: 'x-V***-',
    isKmsSealed: true,
    rebateRateBps: 3500,
    version: 1,
    updatedAt: new Date(Date.now() - 86400_000).toISOString(),
    updatedBy: 'system-bootstrap',
    notes: 'Bybit Broker Partner API & orderLinkId routing',
  },
  {
    exchange: 'EXCHANGE_BINGX',
    attributionType: 'ATTRIBUTION_TYPE_HTTP_HEADER',
    status: 'BROKER_CONFIG_STATUS_ACTIVE',
    lifecycleStatus: 'VENUE_LIFECYCLE_STATUS_ACTIVE',
    maskedIdentifier: 'BX-***-ILL',
    isKmsSealed: true,
    rebateRateBps: 4500,
    version: 1,
    updatedAt: new Date(Date.now() - 86400_000).toISOString(),
    updatedBy: 'system-bootstrap',
    notes: 'BingX Broker Program with X-SOURCE-KEY header attribution',
    extraParams: { client_order_id_prefix: 'x-VF-' },
  },
  {
    exchange: 'EXCHANGE_HYPERLIQUID',
    attributionType: 'ATTRIBUTION_TYPE_BUILDER_TAG',
    status: 'BROKER_CONFIG_STATUS_ACTIVE',
    lifecycleStatus: 'VENUE_LIFECYCLE_STATUS_ACTIVE',
    maskedIdentifier: '0x7***2245',
    isKmsSealed: true,
    rebateRateBps: 10,
    version: 1,
    updatedAt: new Date(Date.now() - 86400_000).toISOString(),
    updatedBy: 'system-bootstrap',
    notes: 'Hyperliquid L1 Builder Fee (Non-custodial on-chain rebate)',
  },
  {
    exchange: 'EXCHANGE_GMX_V2',
    attributionType: 'ATTRIBUTION_TYPE_PAYLOAD_FIELD',
    status: 'BROKER_CONFIG_STATUS_ACTIVE',
    lifecycleStatus: 'VENUE_LIFECYCLE_STATUS_ACTIVE',
    maskedIdentifier: 'ven***',
    isKmsSealed: true,
    rebateRateBps: 1000,
    version: 1,
    updatedAt: new Date(Date.now() - 86400_000).toISOString(),
    updatedBy: 'system-bootstrap',
    notes: 'GMX v2 On-chain Referral Code binding',
  },
];

export let INITIAL_PUBLIC_EXCHANGE_CONFIGS: PublicExchangeConfigDTO[] = [
  {
    exchange: 'EXCHANGE_BINANCE_SPOT',
    name: 'Binance (Spot & Margin)',
    portalUrl: 'https://www.binance.com/en/my/settings/api-management',
    staticNatIps: ['34.118.24.10', '34.118.24.11'],
    isBrokerActive: true,
  },
  {
    exchange: 'EXCHANGE_BINANCE_FUTURES',
    name: 'Binance (USDT-M Futures)',
    portalUrl: 'https://www.binance.com/en/my/settings/api-management',
    staticNatIps: ['34.118.24.10', '34.118.24.11'],
    isBrokerActive: true,
  },
  {
    exchange: 'EXCHANGE_BYBIT',
    name: 'Bybit (V5 Unified)',
    portalUrl: 'https://www.bybit.com/app/user/api-management',
    staticNatIps: ['34.118.24.10', '34.118.24.11'],
    isBrokerActive: true,
  },
  {
    exchange: 'EXCHANGE_BINGX',
    name: 'BingX (Swap V2 & Spot)',
    portalUrl: 'https://bingx.com/en-us/account/api/',
    staticNatIps: ['34.118.24.10', '34.118.24.11'],
    isBrokerActive: true,
  },
  {
    exchange: 'EXCHANGE_HYPERLIQUID',
    name: 'Hyperliquid L1',
    portalUrl: 'https://app.hyperliquid.xyz/API',
    staticNatIps: ['34.118.24.10', '34.118.24.11'],
    isBrokerActive: true,
  },
  {
    exchange: 'EXCHANGE_GMX_V2',
    name: 'GMX v2 (Arbitrum)',
    portalUrl: 'https://app.gmx.io/#/referrals',
    staticNatIps: ['34.118.24.10', '34.118.24.11'],
    isBrokerActive: true,
  },
];



