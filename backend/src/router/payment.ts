import { Router, Request, Response } from "express";
import { z } from "zod";
import { authMiddleware, type AuthPayload } from "../middleware/auth";
import { db } from "../db/schema";
import { createNotification } from "../services/notifications";
import { agentAllocate } from "../services/agent";

export const paymentRouter = Router();

const YEARLY_FEE = 999; // INR - management fee per year

const depositSchema = z.object({
  amount: z.coerce.number().positive(),
  currency: z.enum(["INR", "USD"]).default("INR"),
  payment_method: z.enum(["upi", "stripe", "paypal"]),
  payment_id: z.string().optional(),
});

paymentRouter.use(authMiddleware);

paymentRouter.post("/deposit", async (req: Request & { user?: AuthPayload }, res: Response) => {
  try {
    const userId = req.user!.userId;
    const year = new Date().getFullYear();
    const feePaid = db.prepare("SELECT id FROM user_fees WHERE user_id = ? AND year = ?").get(userId, year);
    if (!feePaid) {
      res.status(402).json({
        error: "Current-year management fee must be paid before depositing. Please pay the yearly fee first.",
      });
      return;
    }

    const parsed = depositSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
      return;
    }
    const { amount, currency, payment_method, payment_id } = parsed.data;

    const amountINR = currency === "USD" ? amount * 83 : amount;

    const stmt = db.prepare(
      "INSERT INTO deposits (user_id, amount, currency, payment_method, payment_id, status) VALUES (?, ?, ?, ?, ?, ?)"
    );
    const result = stmt.run(userId, amountINR, currency, payment_method, payment_id ?? null, "completed");
    const depositId = result.lastInsertRowid as number;

    createNotification(userId, "Deposit Received", `₹${amountINR} received via ${payment_method}. Allocation in progress.`, "deposit");

    const { allocations } = await agentAllocate(userId, amountINR, depositId);

    for (const a of allocations) {
      db.prepare(
        "INSERT INTO allocations (user_id, deposit_id, instrument_type, instrument_name, amount, expected_return) VALUES (?, ?, ?, ?, ?, ?)"
      ).run(userId, depositId, a.instrumentType, a.instrumentName, a.amount, a.expectedReturn);
    }

    res.status(201).json({
      deposit_id: depositId,
      amount: amountINR,
      allocations,
      message: "Deposit received and allocated to stable instruments.",
    });
  } catch (err) {
    console.error("Deposit error:", err);
    res.status(500).json({ error: "Deposit failed" });
  }
});

paymentRouter.post("/fee", async (req: Request & { user?: AuthPayload }, res: Response) => {
  try {
    const userId = req.user!.userId;
    const year = new Date().getFullYear();
    const existing = db.prepare("SELECT id FROM user_fees WHERE user_id = ? AND year = ?").get(userId, year);
    if (existing) {
      res.status(400).json({ error: "Yearly fee already paid for this year" });
      return;
    }
    db.prepare("INSERT INTO user_fees (user_id, amount, year) VALUES (?, ?, ?)").run(userId, YEARLY_FEE, year);
    createNotification(userId, "Fee Paid", `Yearly management fee of ₹${YEARLY_FEE} paid for ${year}.`, "fee");
    res.status(201).json({ fee: YEARLY_FEE, year, message: "Fee paid successfully." });
  } catch (err) {
    console.error("Fee error:", err);
    res.status(500).json({ error: "Fee payment failed" });
  }
});
