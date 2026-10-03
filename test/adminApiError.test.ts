import { describe, it, expect } from 'vitest';
import { AdminApiError, describeAdminError, readJsonOrThrow } from '../src/services/adminApiError';

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
