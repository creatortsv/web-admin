import { vi } from 'vitest';

/** A complete lowerCamelCase wire body per endpoint; tests delete one field at a time. */
export type WireFixture = Record<string, unknown>;

export const statsWire: WireFixture = {
  activeBotsCount: 3,
  totalVolume24hUsd: 1500.5,
  pendingSweepUsd: 20,
  gatewayStatus: 'HEALTHY',
  kafkaLag: 0,
  dbConnections: 4,
  redisMemoryMb: 12,
};

export const vaultWire: WireFixture = {
  id: 'vault-1',
  chain: 'Tron',
  asset: 'USDT',
  receivingAddress: 'receiving-address',
  coldSweepAddress: 'cold-address',
  minDepositUsd: 10,
  sweepThresholdUsd: 100,
  currentBalanceUsd: 5,
  isActive: false,
  updatedAt: '2026-10-01T00:00:00Z',
};

export const userWire: WireFixture = {
  id: 'user-1',
  email: 'user@example.test',
  role: 'trader',
  status: 'ACTIVE',
  activeBotsCount: 2,
  totalVolumeUsd: 10,
  createdAt: '2026-09-01T00:00:00Z',
};

export const botWire: WireFixture = {
  id: 'bot-1',
  userId: 'user-1',
  label: 'grid',
  strategy: 'GRID',
  symbol: 'BTCUSDT',
  status: 'RUNNING',
  activeOrders: 4,
  unrealizedPnlUsd: -1.5,
  startedAt: '2026-09-02T00:00:00Z',
};

export const orderWire: WireFixture = {
  id: 'ord-1',
  clientOrderId: 'client-1',
  userId: 'user-1',
  symbol: 'BTCUSDT',
  side: 'SELL',
  orderType: 'MARKET',
  price: '100.5',
  quantity: '2',
  localStatus: 'REJECTED',
  exchangeStatus: 'FILLED',
  discrepancyType: 'GHOST_FILL',
  lastCheckedAt: '2026-09-03T00:00:00Z',
  createdAt: '2026-09-03T00:00:00Z',
  divergenceAgeSeconds: 30,
};

export const claimWire: WireFixture = {
  id: 'claim-1',
  incidentId: 'inc-1',
  userId: 'user-1',
  amountCents: 100,
  reason: 'slippage',
  evidencePayload: '{"symbol":"BTCUSDT"}',
  status: 'APPROVED',
  createdByAdminId: 'maker-1',
  createdAt: '2026-09-04T00:00:00Z',
  updatedAt: '2026-09-04T00:00:00Z',
};

export const publicExchangeWire: WireFixture = {
  name: 'Bybit',
  portalUrl: 'https://portal.example.test',
  lifecycleStatus: 'VENUE_LIFECYCLE_STATUS_RESTRICTED_NEW',
  allowNewKeys: false,
  allowNewBots: false,
};

export const natEgressIps = ['203.0.113.10', '203.0.113.11'];

export function stubBackendJson(body: unknown): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(body), { status: 200 })),
  );
}

export function without(fixture: WireFixture, field: string): WireFixture {
  const copy: WireFixture = { ...fixture };
  delete copy[field];
  return copy;
}

/**
 * A complete `venom.broker_config.v1.BrokerConfig` as grpc-gateway writes it (lowerCamelCase,
 * every field populated). The values differ from every client-side default on purpose.
 */
export const brokerConfigWire: WireFixture = {
  id: 'cfg-bybit-1',
  exchange: 'bybit',
  environment: 'testnet',
  brokerId: 'partner-id',
  clientOrderIdPrefix: 'VF-BYB-',
  attributionType: 'ATTRIBUTION_TYPE_CLIENT_ORDER_ID_PREFIX',
  headerKey: '',
  headerValue: '',
  payloadParams: {},
  rebatePercentage: 12.5,
  payoutAddress: '',
  isActive: true,
  version: 7,
  maskedIdentifier: 'par***id',
  hasEncryptedSecrets: false,
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: '2026-10-02T10:00:00Z',
  updatedBy: 'admin-42',
  lifecycleStatus: 'VENUE_LIFECYCLE_STATUS_RESTRICTED_NEW',
  sunsetDeadline: null,
  sunsetNotice: '',
};

/** The fields of the broker config wire object that the console requires (no client default exists). */
export const REQUIRED_BROKER_CONFIG_FIELDS = [
  'exchange',
  'environment',
  'attributionType',
  'isActive',
  'lifecycleStatus',
  'rebatePercentage',
  'version',
  'maskedIdentifier',
  'hasEncryptedSecrets',
  'updatedAt',
  'updatedBy',
] as const;
