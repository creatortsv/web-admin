import { describe, it, expect } from 'vitest';
import {
  AdminApiError,
  AdminContractError,
  WIRE_KIND,
  WireObject,
  describeAdminError,
  readJsonOrThrow,
} from '../src/services/adminApiError';

describe('readJsonOrThrow maps the grpc-gateway error body', () => {
  it('resolves with the parsed body on a 2xx response', async () => {
    const res = new Response(JSON.stringify({ vaults: [{ id: 'v1' }] }), { status: 200 });
    await expect(readJsonOrThrow<{ vaults: { id: string }[] }>(res)).resolves.toEqual({
      vaults: [{ id: 'v1' }],
    });
  });

  it('rejects a 403 JSON body with the reason taken from the message field', async () => {
    const res = new Response(JSON.stringify({ code: 7, message: 'admin_routes_disabled' }), {
      status: 403,
      statusText: 'Forbidden',
    });
    const error = await readJsonOrThrow(res).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(AdminApiError);
    expect((error as AdminApiError).status).toBe(403);
    expect((error as AdminApiError).reason).toBe('admin_routes_disabled');
    expect((error as AdminApiError).message).toBe('403 admin_routes_disabled');
  });

  it('rejects a 502 text body with the reason taken from statusText', async () => {
    const res = new Response('upstream connect error', { status: 502, statusText: 'Bad Gateway' });
    const error = await readJsonOrThrow(res).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(AdminApiError);
    expect((error as AdminApiError).status).toBe(502);
    expect((error as AdminApiError).reason).toBe('Bad Gateway');
  });

  it('rejects a JSON body without a message field with the reason taken from statusText', async () => {
    const res = new Response(JSON.stringify({ error: 'other shape' }), {
      status: 500,
      statusText: 'Internal Server Error',
    });
    const error = await readJsonOrThrow(res).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(AdminApiError);
    expect((error as AdminApiError).reason).toBe('Internal Server Error');
  });

  it('lets a network failure of fetch propagate unchanged', async () => {
    const failure = new TypeError('fetch failed');
    const call = async () => readJsonOrThrow(await Promise.reject(failure));
    await expect(call()).rejects.toBe(failure);
  });
});

describe('describeAdminError', () => {
  it('renders the HTTP status and reason of an AdminApiError', () => {
    expect(describeAdminError(new AdminApiError(403, 'admin_routes_disabled'))).toBe(
      '403 admin_routes_disabled',
    );
  });

  it('renders the message of any other Error', () => {
    expect(describeAdminError(new TypeError('fetch failed'))).toBe('fetch failed');
  });

  it('never renders an empty text for a non-Error rejection', () => {
    expect(describeAdminError({ unexpected: true }).length).toBeGreaterThan(0);
  });
});

describe('AdminContractError and the wire reader', () => {
  it('renders the field a malformed 2xx body violated', () => {
    const error = new AdminContractError('vaults[0].isActive', WIRE_KIND.BOOLEAN);
    expect(error.field).toBe('vaults[0].isActive');
    expect(describeAdminError(error)).toContain('vaults[0].isActive');
    expect(describeAdminError(error)).toContain(WIRE_KIND.BOOLEAN);
  });

  it('reads present values, including falsy ones, without defaulting', () => {
    const wire = WireObject.from({ a: '', b: 0, c: false, d: '7' }, 'item');
    expect(wire.string('a')).toBe('');
    expect(wire.number('b')).toBe(0);
    expect(wire.boolean('c')).toBe(false);
    expect(wire.number('d')).toBe(7);
  });

  it('names the path of a missing or mistyped field and never returns a default', () => {
    const wire = WireObject.from({ a: 1, n: Number.NaN }, 'item');
    expect(() => wire.string('a')).toThrow(AdminContractError);
    expect(() => wire.boolean('missing')).toThrow(/item\.missing/);
    expect(() => wire.number('n')).toThrow(/item\.n/);
  });

  it('reads the first present alias and reports the first key when none is present', () => {
    const wire = WireObject.from({ snake_key: 'x' }, 'item');
    expect(wire.string('camelKey', 'snake_key')).toBe('x');
    expect(() => wire.string('other', 'other_snake')).toThrow(/item\.other/);
  });

  it('keeps optional fields undefined when absent and rejects a wrong type', () => {
    const wire = WireObject.from({ a: 1 }, 'item');
    expect(wire.optionalString('missing')).toBeUndefined();
    expect(() => wire.optionalString('a')).toThrow(AdminContractError);
  });

  it('treats an absent list as empty (proto3) and rejects a non-list value', () => {
    expect(WireObject.items({}, 'vaults')).toEqual([]);
    expect(() => WireObject.items({ vaults: {} }, 'vaults')).toThrow(/vaults/);
    expect(() => WireObject.items('text', 'vaults')).toThrow(AdminContractError);
  });

  it('reads optional booleans, numbers and string maps without inventing a value', () => {
    const wire = WireObject.from({ ok: false, n: '12', headers: { a: 'b' }, bad: { a: 1 } }, 'item');
    expect(wire.optionalBoolean('ok')).toBe(false);
    expect(wire.optionalBoolean('missing')).toBeUndefined();
    expect(wire.optionalNumber('n')).toBe(12);
    expect(wire.optionalNumber('missing')).toBeUndefined();
    expect(wire.optionalStringMap('headers')).toEqual({ a: 'b' });
    expect(wire.optionalStringMap('missing')).toBeUndefined();
    expect(() => wire.optionalStringMap('bad')).toThrow(/item\.bad/);
    expect(() => wire.optionalBoolean('n')).toThrow(AdminContractError);
  });
});
