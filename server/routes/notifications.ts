import { Router } from "express";
import { notificationService } from "../services/notificationService";
import { verifyToken, type AuthRequest } from "../middleware/auth";

const router = Router();

router.use(verifyToken);

// Get user notifications
router.get("/", async (req: AuthRequest, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const notifications = await notificationService.getUserNotifications(
      req.user!.id, 
      parseInt(limit as string)
    );
    
    res.json({ notifications });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get unread count
router.get("/unread-count", async (req: AuthRequest, res) => {
  try {
    const count = await notificationService.getUnreadCount(req.user!.id);
    res.json({ count });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Mark notification as read
router.patch("/:id/read", async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    await notificationService.markAsRead(req.user!.id, id);
    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Mark all notifications as read
router.patch("/mark-all-read", async (req: AuthRequest, res) => {
  try {
    await notificationService.markAllAsRead(req.user!.id);
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
