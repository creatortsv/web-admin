/**
 * Error contract of the admin console (WP-0.8b).
 *
 * Every admin call either resolves with the backend's JSON body or rejects with the backend's
 * real HTTP status and reason. A network failure of `fetch` is never wrapped and propagates as is.
 * [Policy Ref: Contract §2.1 - no fake data and no fake success]
 * [Policy Ref: Standards §6.4 - zero fallback mocking]
 */

export class AdminApiError extends Error {
  readonly status: number;
  readonly reason: string;

  constructor(status: number, reason: string) {
    super(reason ? `${status} ${reason}` : String(status));
    this.name = 'AdminApiError';
    this.status = status;
    this.reason = reason;
  }
}

/**
 * The reason of a failed response is the `message` field of the grpc-gateway error body
 * (`{"code":7,"message":"admin_routes_disabled"}`), or `statusText` when the body is not that JSON.
 */
async function readReason(res: Response): Promise<string> {
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    // The body is not JSON (for example a proxy's text error page): the contract names statusText.
    return res.statusText;
  }
  if (typeof body === 'object' && body !== null && 'message' in body) {
    const { message } = body as { message: unknown };
    if (typeof message === 'string' && message !== '') {
      return message;
    }
  }
  return res.statusText;
}

export async function readJsonOrThrow<T>(res: Response): Promise<T> {
  if (res.ok) {
    return (await res.json()) as T;
  }
  throw new AdminApiError(res.status, await readReason(res));
}

/** The text an operator sees for a rejected admin call: `403 admin_routes_disabled`. */
export function describeAdminError(error: unknown): string {
  if (error instanceof Error && error.message !== '') {
    return error.message;
  }
  return String(error);
}
