/**
 * AI Financial Agent - Orchestrates allocation decisions using multi-LLM.
 * Sends notifications for every action. Works with Cursor/no-API mode (Ollama).
 */

import { callLLM, type LLMMessage } from "./llm";
import { allocateStable, type AllocationResult } from "./investment/allocator";
import { createNotification } from "./notifications";

const SYSTEM_PROMPT = `You are an AI financial agent. You manage user funds by allocating to STABLE instruments only:
- Government bonds, post office schemes (PPF, NSC), fixed deposits, sovereign funds.
- NO volatile markets. NO stocks, crypto, or high-risk assets.
- Your goal: positive portfolio returns with minimal risk.
- Be concise. When asked to allocate, respond with a short confirmation and allocation summary.`;

export async function agentAllocate(
  userId: number,
  amount: number,
  depositId?: number
): Promise<{ allocations: AllocationResult[]; agentMessage: string }> {
  const allocations = allocateStable(amount);

  const userPrompt = `User deposited ${amount} INR. Allocate to stable instruments. Amount: ${amount}.`;
  const messages: LLMMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userPrompt },
  ];

  let agentMessage = "";
  try {
    const res = await callLLM(messages);
    agentMessage = res.content || `Allocation completed. ${allocations.length} stable instruments selected.`;
  } catch {
    agentMessage = `Allocation completed. ${allocations.length} stable instruments selected. (Agent offline - using rule-based allocation.)`;
  }

  const summary = allocations
    .map((a) => `${a.instrumentName}: ₹${a.amount} (${a.expectedReturn}% expected)`)
    .join("; ");

  createNotification(
    userId,
    "Funds Allocated",
    `Your deposit of ₹${amount} has been allocated: ${summary}. Agent: ${agentMessage.slice(0, 200)}...`,
    "allocation"
  );

  return { allocations, agentMessage };
}

export async function agentExplainPortfolio(userId: number, portfolioSummary: string): Promise<string> {
  const messages: LLMMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: `Explain this portfolio to the user in simple terms: ${portfolioSummary}` },
  ];
  try {
    const res = await callLLM(messages);
    return res.content || portfolioSummary;
  } catch {
    return portfolioSummary;
  }
}
