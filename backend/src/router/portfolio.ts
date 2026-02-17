import { Router, Request, Response } from "express";
import { authMiddleware, type AuthPayload } from "../middleware/auth";
import { db } from "../db/schema";
import { agentExplainPortfolio } from "../services/agent";

export const portfolioRouter = Router();

portfolioRouter.use(authMiddleware);

portfolioRouter.get("/", async (req: Request & { user?: AuthPayload }, res: Response) => {
  try {
    const userId = req.user!.userId;
    const allocations = db
      .prepare(
        "SELECT instrument_type, instrument_name, amount, expected_return, created_at FROM allocations WHERE user_id = ? ORDER BY created_at DESC"
      )
      .all(userId) as Array<{ instrument_type: string; instrument_name: string; amount: number; expected_return: number; created_at: string }>;

    const total = allocations.reduce((sum, a) => sum + a.amount, 0);
    const weightedReturn =
      total > 0
        ? allocations.reduce((sum, a) => sum + a.amount * a.expected_return, 0) / total
        : 0;

    const summary = `Total: ₹${total}, ${allocations.length} instruments, avg expected return: ${weightedReturn.toFixed(2)}%`;

    let agentExplanation = summary;
    try {
      agentExplanation = await agentExplainPortfolio(userId, summary);
    } catch {
      // use summary if agent fails
    }

    res.json({
      total,
      expected_return_avg: weightedReturn,
      allocations,
      agent_explanation: agentExplanation,
    });
  } catch (err) {
    console.error("Portfolio error:", err);
    res.status(500).json({ error: "Failed to fetch portfolio" });
  }
});
