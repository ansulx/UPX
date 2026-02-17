import { Router, Request, Response } from "express";
import { authMiddleware, type AuthPayload } from "../middleware/auth";
import { getNotifications, markRead } from "../services/notifications";

export const notificationsRouter = Router();

notificationsRouter.use(authMiddleware);

notificationsRouter.get("/", (req: Request & { user?: AuthPayload }, res: Response) => {
  const userId = req.user!.userId;
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
  const notifications = getNotifications(userId, limit);
  res.json({ notifications });
});

notificationsRouter.post("/:id/read", (req: Request & { user?: AuthPayload }, res: Response) => {
  const userId = req.user!.userId;
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid notification ID" });
    return;
  }
  markRead(id, userId);
  res.json({ ok: true });
});
