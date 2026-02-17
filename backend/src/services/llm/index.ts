/**
 * Multi-LLM Provider - Supports OpenAI, Claude, Ollama (Llama), and free tiers.
 * Cursor users without API keys can use Ollama (local Llama) - no API key required.
 */

export type LLMProvider = "openai" | "claude" | "ollama" | "free";

export interface LLMConfig {
  provider: LLMProvider;
  openaiApiKey?: string;
  anthropicApiKey?: string;
  ollamaHost?: string;
}

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMResponse {
  content: string;
  provider: LLMProvider;
}

async function callOpenAI(messages: LLMMessage[], apiKey: string): Promise<string> {
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey });
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });
  return completion.choices[0]?.message?.content ?? "";
}

async function callClaude(messages: LLMMessage[], apiKey: string): Promise<string> {
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic({ apiKey });
  const system = messages.find((m) => m.role === "system")?.content ?? "";
  const userMessages = messages.filter((m) => m.role !== "system");
  const lastUser = userMessages.filter((m) => m.role === "user").pop()?.content ?? "";
  const response = await client.messages.create({
    model: "claude-3-haiku-20240307",
    max_tokens: 1024,
    system,
    messages: [{ role: "user", content: lastUser }],
  });
  const textBlock = response.content.find((b) => b.type === "text");
  return textBlock && "text" in textBlock ? textBlock.text : "";
}

async function callOllama(messages: LLMMessage[], host: string): Promise<string> {
  const url = `${host}/api/chat`;
  const model = process.env.OLLAMA_MODEL || "llama3.2";
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      stream: false,
    }),
  });
  if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
  const data = (await res.json()) as { message?: { content?: string } };
  return data.message?.content ?? "";
}

/**
 * Resolves which provider to use. Priority:
 * 1. Ollama if OLLAMA_HOST set (Cursor/no-API mode)
 * 2. OpenAI if OPENAI_API_KEY set
 * 3. Claude if ANTHROPIC_API_KEY set
 * 4. Ollama at localhost (default for no-API users)
 */
export function resolveProvider(): LLMProvider {
  if (process.env.OLLAMA_HOST) return "ollama";
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.ANTHROPIC_API_KEY) return "claude";
  return "ollama"; // Default: local Llama for Cursor users
}

export async function callLLM(messages: LLMMessage[], config?: Partial<LLMConfig>): Promise<LLMResponse> {
  const provider = config?.provider ?? resolveProvider();
  const ollamaHost = config?.ollamaHost ?? process.env.OLLAMA_HOST ?? "http://localhost:11434";

  try {
    if (provider === "openai" && (config?.openaiApiKey ?? process.env.OPENAI_API_KEY)) {
      const content = await callOpenAI(messages, config?.openaiApiKey ?? process.env.OPENAI_API_KEY!);
      return { content, provider: "openai" };
    }
    if (provider === "claude" && (config?.anthropicApiKey ?? process.env.ANTHROPIC_API_KEY)) {
      const content = await callClaude(messages, config?.anthropicApiKey ?? process.env.ANTHROPIC_API_KEY!);
      return { content, provider: "claude" };
    }
    // Ollama / Cursor mode - no API key needed
    const content = await callOllama(messages, ollamaHost);
    return { content, provider: "ollama" };
  } catch (err) {
    console.error("LLM call failed:", err);
    throw new Error(`LLM provider ${provider} failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}
