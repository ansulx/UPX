import { Router, Request, Response } from "express";
import { authMiddleware, type AuthPayload } from "../middleware/auth";
import { callLLM, resolveProvider, type LLMMessage } from "../services/llm";

export const agentRouter = Router();

agentRouter.use(authMiddleware);

agentRouter.get("/status", (req: Request, res: Response) => {
  const provider = resolveProvider();
  res.json({
    provider,
    message:
      provider === "ollama"
        ? "Using Ollama (Llama) - Cursor mode, no API key required. Set OLLAMA_HOST if needed."
        : `Using ${provider}. API key configured.`,
  });
});

agentRouter.post("/chat", async (req: Request & { user?: AuthPayload }, res: Response) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Message required" });
      return;
    }
    const messages: LLMMessage[] = [
      {
        role: "system",
        content:
          "You are an AI financial agent. You help users understand their stable investments (government bonds, post office, fixed deposits). Be concise and helpful.",
      },
      { role: "user", content: message },
    ];
    const result = await callLLM(messages);
    res.json({ response: result.content || "I'm having trouble connecting. Please try again.", provider: result.provider });
  } catch (err) {
    console.error("Agent chat error:", err);
    res.json({
      response: "Agent is offline. Install Ollama and run 'ollama pull llama3.2' for local AI, or set OPENAI_API_KEY / ANTHROPIC_API_KEY.",
      provider: "offline",
    });
  }
});
