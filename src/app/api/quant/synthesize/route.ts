import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MCP_QUANT_URL = process.env.MCP_QUANT_URL || 'http://127.0.0.1:8085';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const mcpRes = await fetch(`${MCP_QUANT_URL}/api/quant/synthesize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!mcpRes.ok || !mcpRes.body) {
      const errorText = await mcpRes.text().catch(() => 'Unknown error');
      return NextResponse.json(
        { error: `svc-mcp-quant error (${mcpRes.status}): ${errorText}` },
        { status: mcpRes.status || 502 }
      );
    }

    return new Response(mcpRes.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Failed to connect to svc-mcp-quant: ${message}` },
      { status: 502 }
    );
  }
}
