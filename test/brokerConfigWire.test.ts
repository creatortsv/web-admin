import { describe, it, expect, vi, afterEach } from 'vitest';
import { adminApi } from '../src/services/adminApi';
import { AdminContractError } from '../src/services/adminApiError';
import {
  REQUIRED_BROKER_CONFIG_FIELDS,
  brokerConfigWire,
  stubBackendJson,
  without,
} from './support/adminWireFixtures';
import {
  callsOfMethod,
  collect,
  identifiersNamed,
  parseRepositoryFile,
  readRepositoryFile,
} from './support/sourceAst';
import ts from 'typescript';

/**
 * `parseBrokerConfigWire` used to invent `maskedIdentifier` ('***'), `updatedBy` ('system'),
 * `environment` ('production'), `isKmsSealed` (true), `version` (1), `updatedAt` (now) and the
 * exchange of the request. An invented `isKmsSealed: true` is a false security claim. A missing or
 * mistyped field now rejects with `AdminContractError`.
 * [Policy Ref: Contract §2.1 - no fake data; Security §4.6 - no false security claim]
 */
const updateRequest = {
  exchange: 'EXCHANGE_BYBIT' as const,
  attributionType: 'ATTRIBUTION_TYPE_CLIENT_ORDER_ID_PREFIX' as const,
  rawIdentifier: 'partner-id',
  status: 'BROKER_CONFIG_STATUS_ACTIVE' as const,
  rebateRateBps: 1250,
  expectedVersion: 7,
};

afterEach(() => {
  vi.unstubAllGlobals();
});

async function rejection(promise: Promise<unknown>): Promise<unknown> {
  return promise.then(
    () => {
      throw new Error('expected the call to reject, but it resolved');
    },
    (error: unknown) => error,
  );
}

describe('a complete broker config is returned exactly as the backend sent it', () => {
  it('keeps every backend value, including the ones that differ from the old defaults', async () => {
    stubBackendJson({ configs: [brokerConfigWire] });
    const [config] = await adminApi.getBrokerConfigs();
    expect(config.exchange).toBe('EXCHANGE_BYBIT');
    expect(config.environment).toBe('testnet');
    expect(config.maskedIdentifier).toBe('par***id');
    expect(config.isKmsSealed).toBe(false);
    expect(config.version).toBe(7);
    expect(config.updatedAt).toBe('2026-10-02T10:00:00Z');
    expect(config.updatedBy).toBe('admin-42');
    expect(config.rebatePercentage).toBe(12.5);
    expect(config.lifecycleStatus).toBe('VENUE_LIFECYCLE_STATUS_RESTRICTED_NEW');
    expect(config.status).toBe('BROKER_CONFIG_STATUS_ACTIVE');
  });
});

describe('a 2xx broker config that misses a required field rejects', () => {
  it.each(REQUIRED_BROKER_CONFIG_FIELDS)('getBrokerConfigs rejects when %s is missing', async (field) => {
    stubBackendJson({ configs: [without(brokerConfigWire, field)] });
    const error = await rejection(adminApi.getBrokerConfigs());
    expect(error).toBeInstanceOf(AdminContractError);
    expect((error as AdminContractError).field).toBe(`configs[0].${field}`);
  });

  it.each(REQUIRED_BROKER_CONFIG_FIELDS)('getBrokerConfig rejects when %s is missing', async (field) => {
    stubBackendJson({ config: without(brokerConfigWire, field) });
    const error = await rejection(adminApi.getBrokerConfig('EXCHANGE_BYBIT'));
    expect(error).toBeInstanceOf(AdminContractError);
    expect((error as AdminContractError).field).toBe(`config.${field}`);
  });

  it.each(REQUIRED_BROKER_CONFIG_FIELDS)('updateBrokerConfig rejects when %s is missing', async (field) => {
    stubBackendJson({ config: without(brokerConfigWire, field) });
    const error = await rejection(adminApi.updateBrokerConfig({ ...updateRequest, notes: 'reason' }));
    expect(error).toBeInstanceOf(AdminContractError);
    expect((error as AdminContractError).field).toBe(`config.${field}`);
  });

  it.each([
    ['maskedIdentifier', 5],
    ['updatedBy', null],
    ['environment', 1],
    ['hasEncryptedSecrets', 'true'],
    ['version', 'seven'],
    ['isActive', 'yes'],
    ['lifecycleStatus', 'VENUE_LIFECYCLE_STATUS_UNKNOWN'],
    ['attributionType', 'NOT_AN_ATTRIBUTION'],
  ])('rejects a mistyped %s', async (field, value) => {
    stubBackendJson({ configs: [{ ...brokerConfigWire, [field]: value }] });
    const error = await rejection(adminApi.getBrokerConfigs());
    expect(error).toBeInstanceOf(AdminContractError);
    expect((error as AdminContractError).field).toBe(`configs[0].${field}`);
  });

  it('does not substitute the requested exchange for an exchange the backend did not send', async () => {
    stubBackendJson({ config: without(brokerConfigWire, 'exchange') });
    const error = await rejection(adminApi.updateBrokerConfig({ ...updateRequest, notes: 'reason' }));
    expect(error).toBeInstanceOf(AdminContractError);
    expect((error as AdminContractError).field).toBe('config.exchange');
  });

  it('rejects an empty exchange', async () => {
    stubBackendJson({ configs: [{ ...brokerConfigWire, exchange: '' }] });
    const error = await rejection(adminApi.getBrokerConfigs());
    expect(error).toBeInstanceOf(AdminContractError);
    expect((error as AdminContractError).field).toBe('configs[0].exchange');
  });

  it.each(['updateBrokerConfig', 'proposeVenueDecommission', 'approveVenueDecommission', 'rejectVenueDecommission'] as const)(
    '%s rejects a body without the config object',
    async (method) => {
      stubBackendJson({});
      const call = {
        updateBrokerConfig: () => adminApi.updateBrokerConfig({ ...updateRequest, notes: 'reason' }),
        proposeVenueDecommission: () => adminApi.proposeVenueDecommission('EXCHANGE_BYBIT', 'maker', 'reason'),
        approveVenueDecommission: () => adminApi.approveVenueDecommission('EXCHANGE_BYBIT', 'checker'),
        rejectVenueDecommission: () => adminApi.rejectVenueDecommission('EXCHANGE_BYBIT', 'checker', 'reason'),
      }[method];
      const error = await rejection(call());
      expect(error).toBeInstanceOf(AdminContractError);
      expect((error as AdminContractError).field).toBe('config');
    },
  );

  it('rejects a decommission proposal that misses a required field instead of inventing it', async () => {
    const proposal = { proposedBy: 'maker', proposedAt: '2026-10-02T11:00:00Z', reason: 'sunset', status: 'PENDING_APPROVAL' };
    for (const field of ['proposedBy', 'proposedAt', 'reason', 'status']) {
      stubBackendJson({ configs: [{ ...brokerConfigWire, decommissionProposal: without(proposal, field) }] });
      const error = await rejection(adminApi.getBrokerConfigs());
      expect(error, field).toBeInstanceOf(AdminContractError);
      expect((error as AdminContractError).field).toBe(`configs[0].decommissionProposal.${field}`);
    }
  });

  it('returns a complete decommission proposal as sent', async () => {
    const proposal = {
      proposedBy: 'maker',
      proposedAt: '2026-10-02T11:00:00Z',
      reason: 'sunset',
      status: 'PENDING_APPROVAL',
    };
    stubBackendJson({ configs: [{ ...brokerConfigWire, decommissionProposal: proposal }] });
    const [config] = await adminApi.getBrokerConfigs();
    expect(config.decommissionProposal).toEqual(proposal);
  });
});

describe('the broker PUT sends no default reason', () => {
  async function sentBody(notes: string | undefined): Promise<Record<string, unknown>> {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ config: brokerConfigWire }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    await adminApi.updateBrokerConfig({ ...updateRequest, ...(notes === undefined ? {} : { notes }) });
    const init = fetchMock.mock.calls[0] as unknown as [unknown, RequestInit];
    return JSON.parse(String(init[1].body)) as Record<string, unknown>;
  }

  it('omits change_reason when the operator gave none', async () => {
    const body = await sentBody(undefined);
    expect('change_reason' in body).toBe(false);
    expect(JSON.stringify(body)).not.toContain('Updated via Admin Console');
  });

  it('omits change_reason when the operator reason is blank', async () => {
    const body = await sentBody('   ');
    expect('change_reason' in body).toBe(false);
  });

  it('sends the operator reason exactly as typed', async () => {
    const body = await sentBody('Fee schedule renegotiated');
    expect(body.change_reason).toBe('Fee schedule renegotiated');
  });
});

describe('source level guards', () => {
  it('adminApi.ts carries no default reason, no fallback exchange and no `any`', () => {
    const source = readRepositoryFile('src/services/adminApi.ts');
    expect(source).not.toContain('Updated via Admin Console');
    expect(source).not.toContain('fallbackExchange');
    const sourceFile = parseRepositoryFile('src/services/adminApi.ts');
    const anyKeywords = collect(sourceFile, (node): node is ts.KeywordTypeNode => node.kind === ts.SyntaxKind.AnyKeyword);
    expect(anyKeywords.length).toBe(0);
  });

  it('the broker config parser invents none of the values the old parser defaulted', () => {
    const source = readRepositoryFile('src/services/adminApi.ts');
    const start = source.indexOf('export function parseBrokerConfigWire');
    expect(start).toBeGreaterThan(-1);
    const parser = source.slice(start, source.indexOf('/**\n * Generates a W3C traceparent header'));
    expect(parser).not.toMatch(/\|\| 'system'/);
    expect(parser).not.toMatch(/\|\| '\*\*\*'/);
    expect(parser).not.toMatch(/\|\| 'production'/);
    expect(parser).not.toMatch(/new Date\(/);
    expect(parser).not.toMatch(/\?\? (true|false|1|0)\b/);
    expect(source).not.toMatch(/\|\| 'PENDING_APPROVAL'/);
  });

  const page = parseRepositoryFile('src/app/settings/broker-rebates/page.tsx');
  const calls = callsOfMethod(page, 'adminApi', 'updateBrokerConfig');

  it('the broker-rebates page has two update call sites', () => {
    expect(calls.length).toBe(2);
  });

  it('every update call passes the operator reason, never a generated text', () => {
    for (const call of calls) {
      const argument = call.arguments[0];
      expect(ts.isObjectLiteralExpression(argument)).toBe(true);
      const notes = (argument as ts.ObjectLiteralExpression).properties.find(
        (property): property is ts.PropertyAssignment | ts.ShorthandPropertyAssignment =>
          (ts.isPropertyAssignment(property) || ts.isShorthandPropertyAssignment(property)) &&
          property.name.getText() === 'notes',
      );
      expect(notes).toBeDefined();
      const value = ts.isPropertyAssignment(notes!) ? notes!.initializer.getText() : notes!.name.getText();
      expect(value).toBe('reason');
    }
    expect(readRepositoryFile('src/app/settings/broker-rebates/page.tsx')).not.toContain('Lifecycle updated to');
  });

  it('every update call is preceded by the required-reason check in the same handler', () => {
    const references = identifiersNamed(page, 'CHANGE_REASON_REQUIRED');
    expect(references.length).toBeGreaterThanOrEqual(2);
    for (const call of calls) {
      let handler: ts.Node | undefined = call.parent;
      while (handler !== undefined && !ts.isArrowFunction(handler)) {
        handler = handler.parent;
      }
      expect(handler).toBeDefined();
      const guard = references.find(
        (reference) => reference.getStart() >= handler!.getStart() && reference.getEnd() <= handler!.getEnd(),
      );
      expect(guard, 'a CHANGE_REASON_REQUIRED guard inside the handler').toBeDefined();
      expect(guard!.getStart()).toBeLessThan(call.getStart());
    }
  });
});
