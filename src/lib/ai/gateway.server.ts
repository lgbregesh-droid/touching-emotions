// Server-only helpers for the Lovable AI gateway.
// NEVER import this from client code.

const GATEWAY_BASE = "https://ai.gateway.lovable.dev/v1";

function apiKey() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY is not configured");
  return key;
}

export class AIGatewayError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

function mapStatus(status: number, body: string): AIGatewayError {
  if (status === 429) return new AIGatewayError("חרגנו ממגבלת השימוש ב-AI. נסי שוב בעוד דקה.", 429);
  if (status === 402) return new AIGatewayError("נגמרו הקרדיטים ל-AI. יש להוסיף קרדיט ב-Lovable Cloud.", 402);
  return new AIGatewayError(`AI gateway error (${status}): ${body.slice(0, 300)}`, status);
}

export async function chatCompletion(opts: {
  model: string;
  system: string;
  user: string;
  tools?: unknown[];
  toolChoice?: unknown;
  temperature?: number;
}) {
  const res = await fetch(`${GATEWAY_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: opts.model,
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.user },
      ],
      ...(opts.tools ? { tools: opts.tools } : {}),
      ...(opts.toolChoice ? { tool_choice: opts.toolChoice } : {}),
      temperature: opts.temperature ?? 0.3,
    }),
  });
  if (!res.ok) throw mapStatus(res.status, await res.text());
  return res.json() as Promise<{
    choices?: {
      message?: {
        content?: string;
        tool_calls?: { function?: { name?: string; arguments?: string } }[];
      };
    }[];
  }>;
}

export async function embed(input: string | string[], opts?: { dimensions?: number }) {
  const res = await fetch(`${GATEWAY_BASE}/embeddings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-embedding-001",
      input,
      ...(opts?.dimensions ? { dimensions: opts.dimensions } : {}),
    }),
  });
  if (!res.ok) throw mapStatus(res.status, await res.text());
  const data = (await res.json()) as { data: { embedding: number[]; index: number }[] };
  return data.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
}
