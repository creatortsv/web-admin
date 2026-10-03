import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { adminApi } from '../src/services/adminApi';
import { AdminContractError } from '../src/services/adminApiError';
import { stubBrowserStorage } from './support/adminBackend';
import {
  brokerConfigWire,
  claimWire,
  natEgressIps,
  orderWire,
  publicExchangeWire,
  statsWire,
  stubBackendJson,
  userWire,
  vaultWire,
  botWire,
  type WireFixture,
} from './support/adminWireFixtures';

/**
 * The gateway keeps grpc-gateway's default marshaler, which writes proto3 JSON in lowerCamelCase
 * (Standards §4.5). The console accepts only those keys and only the enum values of its contract.
 * [Policy Ref: Standards §4.5 - canonical lowerCamelCase wire; Contract §2.1 - no fake data]
 */

/** `totalVolume24hUsd` becomes `total_volume_24h_usd`, the proto field name. */
function snakeCase(key: string): string {
  return key
    .replace(/([A-Z])/g, '_$1')
    .replace(/([a-z])(\d)/g, '$1_$2')
    .toLowerCase();
}

function renameKey(fixture: WireFixture, field: string, renamed: string): WireFixture {
  const copy: WireFixture = {};
  for (const [key, value] of Object.entries(fixture)) {
    copy[key === field ? renamed : key] = value;
  }
  return copy;
}

function allKeysSnakeCase(fixture: WireFixture): WireFixture {
  const copy: WireFixture = {};
  for (const [key, value] of Object.entries(fixture)) {
    copy[snakeCase(key)] = value;
  }
  return copy;
}

async function rejection(call: () => Promise<unknown>): Promise<unknown> {
  return call().then(
    () => {
      throw new Error('expected the call to reject, but it resolved');
    },
    (e: unknown) => e,
  );
}

async function expectContractError(call: () => Promise<unknown>, path: string): Promise<void> {
  const error = await rejection(call);
  expect(error).toBeInstanceOf(AdminContractError);
  expect((error as AdminContractError).field).toBe(path);
}

interface ReaderCase {
  readonly name: string;
  readonly call: () => Promise<unknown>;
  readonly fixture: WireFixture;
  readonly body: (fixture: WireFixture) => unknown;
  /** The path prefix of the fixture's fields in a contract error. */
  readonly prefix: string;
}

const listBody = (listKey: string) => (item: WireFixture) => ({ [listKey]: [item] });

const readers: readonly ReaderCase[] = [
  { name: 'getSystemStats', call: () => adminApi.getSystemStats(), fixture: statsWire, body: (f) => f, prefix: '' },
  {
    name: 'getTreasuryVaults',
    call: () => adminApi.getTreasuryVaults(),
    fixture: vaultWire,
    body: listBody('vaults'),
    prefix: 'vaults[0].',
  },
  { name: 'getUsers', call: () => adminApi.getUsers(), fixture: userWire, body: listBody('users'), prefix: 'users[0].' },
  {
    name: 'getFleetBots',
    call: () => adminApi.getFleetBots(),
    fixture: botWire,
    body: listBody('bots'),
    prefix: 'bots[0].',
  },
  {
    name: 'getDivergentOrders',
    call: () => adminApi.getDivergentOrders(),
    fixture: orderWire,
    body: listBody('orders'),
    prefix: 'orders[0].',
  },
  {
    name: 'getCompensationClaims',
    call: () => adminApi.getCompensationClaims(),
    fixture: claimWire,
    body: listBody('claims'),
    prefix: 'claims[0].',
  },
  {
    name: 'getPublicExchangeConfigs (exchanges map)',
    call: () => adminApi.getPublicExchangeConfigs(),
    fixture: publicExchangeWire,
    body: (f) => ({ natEgressIps, exchanges: { bybit: f } }),
    prefix: 'exchanges.bybit.',
  },
  {
    name: 'getPublicExchangeConfigs (configs list)',
    call: () => adminApi.getPublicExchangeConfigs(),
    fixture: { ...publicExchangeWire, exchange: 'EXCHANGE_BYBIT' },
    body: (f) => ({ natEgressIps, configs: [f] }),
    prefix: 'configs[0].',
  },
];

const snakeCaseFields = readers.flatMap((reader) =>
  Object.keys(reader.fixture)
    .filter((field) => snakeCase(field) !== field)
    .map((field) => [reader.name, field, reader] as const),
);

describe('the readers accept only the lowerCamelCase keys of the gateway', () => {
  beforeEach(() => {
    stubBrowserStorage();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each(readers)('$name resolves its complete lowerCamelCase body', async ({ call, body, fixture }) => {
    stubBackendJson(body(fixture));
    await expect(call()).resolves.toBeDefined();
  });

  it.each(readers)('$name rejects a body whose keys are all snake_case', async ({ call, body, fixture, prefix }) => {
    stubBackendJson(body(allKeysSnakeCase(fixture)));
    const error = await rejection(call);
    expect(error).toBeInstanceOf(AdminContractError);
    expect((error as AdminContractError).field.startsWith(prefix)).toBe(true);
  });

  it.each(snakeCaseFields)('%s rejects the snake_case spelling of %s', async (_name, field, reader) => {
    stubBackendJson(reader.body(renameKey(reader.fixture, field, snakeCase(field))));
    await expectContractError(reader.call, `${reader.prefix}${field}`);
  });

  it('testBrokerAttribution resolves the lowerCamelCase answer of the backend', async () => {
    stubBackendJson({
      isValid: true,
      formattedClientOrderId: 'VF-BYB-1',
      injectedHeaders: { 'X-Source': 'venom' },
      injectedPayloadFields: { ref: 'venom' },
      formattingLatencyNanos: '1200',
      diagnosticMessage: 'accepted',
    });
    await expect(
      adminApi.testBrokerAttribution({ exchange: 'EXCHANGE_BYBIT', testOrderId: 'order-1' }),
    ).resolves.toEqual({
      success: true,
      attributedOrderId: 'VF-BYB-1',
      injectedHeaders: { 'X-Source': 'venom' },
      injectedParams: { ref: 'venom' },
      statusMessage: 'accepted',
      attributionLatencyNanos: 1200,
    });
  });

  it('testBrokerAttribution rejects a body whose keys are all snake_case', async () => {
    stubBackendJson({
      is_valid: true,
      formatted_client_order_id: 'VF-BYB-1',
      injected_headers: { 'X-Source': 'venom' },
      injected_payload_fields: { ref: 'venom' },
      formatting_latency_nanos: '1200',
      diagnostic_message: 'accepted',
    });
    await expectContractError(
      () => adminApi.testBrokerAttribution({ exchange: 'EXCHANGE_BYBIT', testOrderId: 'order-1' }),
      'isValid',
    );
  });

  it('a decommission proposal with snake_case keys rejects with the field path', async () => {
    stubBackendJson({
      config: {
        ...brokerConfigWire,
        decommissionProposal: {
          proposed_by: 'maker-1',
          proposed_at: '2026-10-02T10:00:00Z',
          reason: 'sunset',
          status: 'PENDING_APPROVAL',
        },
      },
    });
    await expectContractError(
      () => adminApi.proposeVenueDecommission('EXCHANGE_BYBIT', 'maker-1', 'sunset'),
      'config.decommissionProposal.proposedBy',
    );
  });

  it('a decommission proposal in lowerCamelCase resolves', async () => {
    stubBackendJson({
      config: {
        ...brokerConfigWire,
        decommissionProposal: {
          proposedBy: 'maker-1',
          proposedAt: '2026-10-02T10:00:00Z',
          reason: 'sunset',
          status: 'PENDING_APPROVAL',
        },
      },
    });
    const config = await adminApi.proposeVenueDecommission('EXCHANGE_BYBIT', 'maker-1', 'sunset');
    expect(config.decommissionProposal?.proposedBy).toBe('maker-1');
  });

  it('an optional field in snake_case is not read', async () => {
    stubBackendJson({
      claims: [
        {
          ...claimWire,
          approved_by_admin_id: 'checker-1',
          rejection_reason: 'duplicate',
          approved_at: '2026-09-05T00:00:00Z',
        },
      ],
    });
    const [claim] = await adminApi.getCompensationClaims();
    expect(claim.approvedByAdminId).toBeUndefined();
    expect(claim.rejectionReason).toBeUndefined();
    expect(claim.approvedAt).toBeUndefined();
  });

  it('triggerSweep does not read sweep_id and tx_hash', async () => {
    stubBackendJson({ success: true, message: 'queued', sweep_id: 'sweep-1', tx_hash: '0xabc' });
    const res = await adminApi.triggerSweep('vault-1');
    expect(res.sweepId).toBeUndefined();
    expect(res.txHash).toBeUndefined();
  });

  it('triggerSweep reads sweepId and txHash', async () => {
    stubBackendJson({ success: true, message: 'queued', sweepId: 'sweep-1', txHash: '0xabc' });
    const res = await adminApi.triggerSweep('vault-1');
    expect(res.sweepId).toBe('sweep-1');
    expect(res.txHash).toBe('0xabc');
  });
});

interface EnumField {
  readonly reader: string;
  readonly field: string;
  readonly values: readonly string[];
}

const enumFields: readonly EnumField[] = [
  { reader: 'getUsers', field: 'role', values: ['super_admin', 'admin', 'trader', 'sandbox'] },
  { reader: 'getUsers', field: 'status', values: ['ACTIVE', 'SUSPENDED', 'BANNED'] },
  { reader: 'getFleetBots', field: 'status', values: ['RUNNING', 'SOFT_STOPPING', 'STOPPED', 'ERROR'] },
  { reader: 'getDivergentOrders', field: 'side', values: ['BUY', 'SELL'] },
  { reader: 'getDivergentOrders', field: 'orderType', values: ['LIMIT', 'MARKET', 'LIMIT_MAKER'] },
  {
    reader: 'getDivergentOrders',
    field: 'localStatus',
    values: ['IN_FLIGHT_UNKNOWN', 'PENDING_SUBMIT', 'REJECTED', 'NEW'],
  },
  {
    reader: 'getDivergentOrders',
    field: 'exchangeStatus',
    values: ['FILLED', 'PARTIALLY_FILLED', 'NEW', 'CANCELED', 'REJECTED', 'NOT_FOUND'],
  },
  {
    reader: 'getDivergentOrders',
    field: 'discrepancyType',
    values: ['STATE_MISMATCH', 'IN_FLIGHT_TIMEOUT', 'UNKNOWN_ON_EXCHANGE', 'GHOST_FILL'],
  },
  { reader: 'getCompensationClaims', field: 'status', values: ['PENDING_APPROVAL', 'APPROVED', 'REJECTED'] },
  { reader: 'getSystemStats', field: 'gatewayStatus', values: ['HEALTHY', 'DEGRADED'] },
  {
    reader: 'getPublicExchangeConfigs (exchanges map)',
    field: 'lifecycleStatus',
    values: [
      'VENUE_LIFECYCLE_STATUS_UNSPECIFIED',
      'VENUE_LIFECYCLE_STATUS_ACTIVE',
      'VENUE_LIFECYCLE_STATUS_RESTRICTED_NEW',
      'VENUE_LIFECYCLE_STATUS_SUNSETTING',
      'VENUE_LIFECYCLE_STATUS_TERMINATED',
    ],
  },
  {
    reader: 'getPublicExchangeConfigs (configs list)',
    field: 'lifecycleStatus',
    values: [
      'VENUE_LIFECYCLE_STATUS_ACTIVE',
      'VENUE_LIFECYCLE_STATUS_RESTRICTED_NEW',
      'VENUE_LIFECYCLE_STATUS_SUNSETTING',
      'VENUE_LIFECYCLE_STATUS_TERMINATED',
    ],
  },
];

const OUT_OF_RANGE_VALUE = 'NOT_A_CONTRACT_VALUE';

function readerOf(name: string): ReaderCase {
  const reader = readers.find((candidate) => candidate.name === name);
  if (reader === undefined) {
    throw new Error(`no reader case named ${name}`);
  }
  return reader;
}

describe('the readers accept only the enum values of the contract', () => {
  beforeEach(() => {
    stubBrowserStorage();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each(enumFields.map((e) => [e.reader, e.field, e] as const))(
    '%s rejects an out-of-range %s',
    async (_name, field, spec) => {
      const reader = readerOf(spec.reader);
      stubBackendJson(reader.body({ ...reader.fixture, [field]: OUT_OF_RANGE_VALUE }));
      await expectContractError(reader.call, `${reader.prefix}${field}`);
    },
  );

  it.each(enumFields.map((e) => [e.reader, e.field, e] as const))(
    '%s rejects a lower-case spelling of a valid %s',
    async (_name, field, spec) => {
      const reader = readerOf(spec.reader);
      const lowerCased = spec.values[0] === spec.values[0].toLowerCase() ? spec.values[0].toUpperCase() : spec.values[0].toLowerCase();
      stubBackendJson(reader.body({ ...reader.fixture, [field]: lowerCased }));
      await expectContractError(reader.call, `${reader.prefix}${field}`);
    },
  );

  const members = enumFields.flatMap((spec) => spec.values.map((value) => [spec.reader, spec.field, value, spec] as const));

  it.each(members)('%s accepts %s = %s', async (_name, field, value, spec) => {
    const reader = readerOf(spec.reader);
    stubBackendJson(reader.body({ ...reader.fixture, [field]: value }));
    await expect(reader.call()).resolves.toBeDefined();
  });
});
