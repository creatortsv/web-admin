import { NextRequest } from 'next/server';
import { QuantAgentHarness, TelemetryChunk } from '@/services/quant/harness/quantAgentHarness';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const harness = new QuantAgentHarness();
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const presets = await harness.run({
            provider: body.provider || 'openrouter',
            apiKey: body.apiKey || '',
            selectedModel: body.selectedModel || 'anthropic/claude-3.5-sonnet',
            customModel: body.customModel || '',
            targetPairs: body.targetPairs || ['BTC/USDT', 'ETH/USDT'],
            minTargetApr: Number(body.minTargetApr) || 45,
            maxDrawdown: Number(body.maxDrawdown) || 8.5,
            lookbackDays: Number(body.lookbackDays) || 90,
            riskProfile: body.riskProfile || 'BALANCED',
            systemPrompt: body.systemPrompt,
            onProgress: (chunk: TelemetryChunk) => {
              const data = `data: ${JSON.stringify(chunk)}\n\n`;
              controller.enqueue(encoder.encode(data));
            },
          });

          // Final payload with compiled presets
          const finalEvent = `data: ${JSON.stringify({
            stage: 'PRESETS',
            progressPercent: 100,
            log: 'All strategy presets successfully verified and ready.',
            presets,
          })}\n\n`;
          controller.enqueue(encoder.encode(finalEvent));

          controller.close();
        } catch (err: unknown) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          const errorData = `data: ${JSON.stringify({
            stage: 'COMPLETED',
            progressPercent: 100,
            log: `[ERROR] Harness execution failed: ${errorMsg}`,
          })}\n\n`;
          controller.enqueue(encoder.encode(errorData));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid request';
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
