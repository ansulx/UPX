import { db } from "../db/schema";

export type NotificationType = "info" | "allocation" | "deposit" | "fee" | "alert";

export function createNotification(
  userId: number,
  title: string,
  message: string,
  type: NotificationType = "info"
) {
  db.prepare(
    "INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)"
  ).run(userId, title, message, type);
}

export function getNotifications(userId: number, limit = 50) {
  return db
    .prepare(
      "SELECT id, title, message, type, read_at, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?"
    )
    .all(userId, limit) as Array<{
    id: number;
    title: string;
    message: string;
    type: NotificationType;
    read_at: string | null;
    created_at: string;
  }>;
}

export function markRead(notificationId: number, userId: number) {
  db.prepare("UPDATE notifications SET read_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?").run(
    notificationId,
    userId
  );
}
