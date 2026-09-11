import { NextRequest, NextResponse } from 'next/server';

const GATEWAY_BASE = process.env.API_GATEWAY_URL || 'http://localhost:8080';

/**
 * Next.js Edge / Node Route Proxy Stub for Venom Finance Web-Admin Treasury Control Plane.
 * Proxies /api/treasury/* directly to internal svc-gateway / gRPC-gateway with distributed tracing.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const subpath = path.join('/');
  const targetUrl = `${GATEWAY_BASE}/v1/treasury/${subpath}${request.nextUrl.search}`;

  const traceparent = request.headers.get('traceparent') || `00-${Date.now().toString(16).padStart(32, '0')}-01`;
  const authHeader = request.headers.get('authorization') || '';

  try {
    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'traceparent': traceparent,
        ...(authHeader ? { 'authorization': authHeader } : {}),
      },
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: 'TREASURY_GATEWAY_UNAVAILABLE',
        message: err?.message || 'Failed to reach API gateway for treasury endpoint',
        path: subpath,
      },
      { status: 502 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const subpath = path.join('/');
  const targetUrl = `${GATEWAY_BASE}/v1/treasury/${subpath}`;

  const traceparent = request.headers.get('traceparent') || `00-${Date.now().toString(16).padStart(32, '0')}-01`;
  const authHeader = request.headers.get('authorization') || '';
  const body = await request.text();

  try {
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'traceparent': traceparent,
        ...(authHeader ? { 'authorization': authHeader } : {}),
      },
      body,
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: 'TREASURY_GATEWAY_UNAVAILABLE',
        message: err?.message || 'Failed to reach API gateway for treasury endpoint',
        path: subpath,
      },
      { status: 502 }
    );
  }
}
