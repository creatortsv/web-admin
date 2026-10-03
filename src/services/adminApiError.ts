/**
 * Error contract of the admin console (WP-0.8b).
 *
 * Every admin call either resolves with the backend's JSON body or rejects with the backend's
 * real HTTP status and reason. A network failure of `fetch` is never wrapped and propagates as is.
 * [Policy Ref: Contract §2.1 - no fake data and no fake success]
 * [Policy Ref: Standards §6.4 - no client-side fallbacks]
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

/**
 * A 2xx body that does not satisfy the contract of the UI type (a required field is missing or has
 * the wrong type). The console fails closed: it never invents a value for the field.
 * `field` is the path of the violated field, for example `vaults[0].isActive`.
 */
export class AdminContractError extends Error {
  readonly field: string;

  constructor(field: string, expected: WireKind) {
    super(`Invalid backend response: field "${field}" is missing or not ${expected}`);
    this.name = 'AdminContractError';
    this.field = field;
  }
}

export const WIRE_KIND = {
  STRING: 'a string',
  NUMBER: 'a finite number',
  BOOLEAN: 'a boolean',
  OBJECT: 'an object',
  LIST: 'a list',
  STRING_LIST: 'a list of strings',
  STRING_MAP: 'a map of strings',
} as const;

export type WireKind = (typeof WIRE_KIND)[keyof typeof WIRE_KIND];

type WireRecord = Record<string, unknown>;

const ROOT_PATH = 'response';

function isWireRecord(value: unknown): value is WireRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Structural reader of one wire object. Every accessor takes the field names the backend may use
 * (lowerCamelCase first, then a legacy alias) and returns the first one that is present.
 * A required accessor throws `AdminContractError` for a missing or mistyped field and never
 * substitutes a default; an optional accessor returns `undefined` for an absent field.
 * The typed generated admin client of WP-8.5a replaces this reader.
 * [Policy Ref: Contract §2.1 - no fake data; Contract §5.10 - zero any]
 */
export class WireObject {
  private constructor(
    private readonly record: WireRecord,
    private readonly path: string,
  ) {}

  static from(value: unknown, path: string = ROOT_PATH): WireObject {
    if (!isWireRecord(value)) {
      throw new AdminContractError(path, WIRE_KIND.OBJECT);
    }
    return new WireObject(value, path);
  }

  /**
   * The items of a list field. An absent list is empty (proto3 omits an empty repeated field);
   * a body that is itself a list is read as that list.
   */
  static items(body: unknown, listKey: string): WireObject[] {
    if (Array.isArray(body)) {
      return WireObject.itemsOf(body, listKey);
    }
    return WireObject.from(body).list(listKey);
  }

  private static itemsOf(values: unknown[], path: string): WireObject[] {
    return values.map((item, index) => WireObject.from(item, `${path}[${index}]`));
  }

  /** The items of a list field; an absent list is empty (proto3 omits an empty repeated field). */
  list(key: string): WireObject[] {
    const value = this.present([key]);
    if (value === undefined) {
      return [];
    }
    if (!Array.isArray(value)) {
      throw this.violation([key], WIRE_KIND.LIST);
    }
    return WireObject.itemsOf(value, this.qualify(key));
  }

  string(...keys: string[]): string {
    const value = this.present(keys);
    if (typeof value !== 'string') {
      throw this.violation(keys, WIRE_KIND.STRING);
    }
    return value;
  }

  /** `undefined` when the field is absent or null; a value of another type is a contract error. */
  optionalString(...keys: string[]): string | undefined {
    const value = this.present(keys);
    if (value === undefined || value === null) {
      return undefined;
    }
    if (typeof value !== 'string') {
      throw this.violation(keys, WIRE_KIND.STRING);
    }
    return value;
  }

  boolean(...keys: string[]): boolean {
    const value = this.present(keys);
    if (typeof value !== 'boolean') {
      throw this.violation(keys, WIRE_KIND.BOOLEAN);
    }
    return value;
  }

  /** A finite number; a decimal string is accepted because proto3 JSON writes 64-bit integers as strings. */
  number(...keys: string[]): number {
    const value = this.present(keys);
    const parsed = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
    if (typeof parsed !== 'number' || !Number.isFinite(parsed)) {
      throw this.violation(keys, WIRE_KIND.NUMBER);
    }
    return parsed;
  }

  stringList(...keys: string[]): string[] {
    const value = this.present(keys);
    if (!Array.isArray(value) || !value.every((item): item is string => typeof item === 'string')) {
      throw this.violation(keys, WIRE_KIND.STRING_LIST);
    }
    return value;
  }

  /** `undefined` when the field is absent or null; a value of another type is a contract error. */
  optionalBoolean(...keys: string[]): boolean | undefined {
    const value = this.present(keys);
    if (value === undefined || value === null) {
      return undefined;
    }
    if (typeof value !== 'boolean') {
      throw this.violation(keys, WIRE_KIND.BOOLEAN);
    }
    return value;
  }

  /** `undefined` when the field is absent or null; a value that is not a finite number is a contract error. */
  optionalNumber(...keys: string[]): number | undefined {
    const value = this.present(keys);
    return value === undefined || value === null ? undefined : this.number(...keys);
  }

  /** `undefined` when the field is absent or null; a value that is not a string-to-string map is a contract error. */
  optionalStringMap(...keys: string[]): Record<string, string> | undefined {
    const value = this.present(keys);
    if (value === undefined || value === null) {
      return undefined;
    }
    if (!isWireRecord(value) || !Object.values(value).every((item): item is string => typeof item === 'string')) {
      throw this.violation(keys, WIRE_KIND.STRING_MAP);
    }
    return value as Record<string, string>;
  }

  /** Whether the backend sent the field at all. */
  has(...keys: string[]): boolean {
    return this.present(keys) !== undefined;
  }

  /** The entries of a nested map object (empty when the field is absent), each named after its key. */
  entries(key: string): Array<readonly [string, WireObject]> {
    const value = this.present([key]);
    if (value === undefined) {
      return [];
    }
    if (!isWireRecord(value)) {
      throw this.violation([key], WIRE_KIND.OBJECT);
    }
    return Object.entries(value).map(
      ([entryKey, entry]) => [entryKey, WireObject.from(entry, `${this.qualify(key)}.${entryKey}`)] as const,
    );
  }

  private present(keys: readonly string[]): unknown {
    for (const key of keys) {
      if (this.record[key] !== undefined) {
        return this.record[key];
      }
    }
    return undefined;
  }

  private violation(keys: readonly string[], expected: WireKind): AdminContractError {
    return new AdminContractError(this.qualify(keys[0]), expected);
  }

  private qualify(key: string): string {
    return this.path === ROOT_PATH ? key : `${this.path}.${key}`;
  }
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
