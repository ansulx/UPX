import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { userRouter } from "./router/user";
import { paymentRouter } from "./router/payment";
import { portfolioRouter } from "./router/portfolio";
import { notificationsRouter } from "./router/notifications";
import { agentRouter } from "./router/agent";
import { initDb } from "./db/schema";

const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

initDb();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/v1/user", userRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/portfolio", portfolioRouter);
app.use("/api/v1/notifications", notificationsRouter);
app.use("/api/v1/agent", agentRouter);

app.get("/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AI Financial Agent API running on http://localhost:${PORT}`);
  console.log("Cursor mode (no API keys): ensure Ollama is running at http://localhost:11434");
});
