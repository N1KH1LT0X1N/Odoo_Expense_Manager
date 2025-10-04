import { Router } from "express";
import { auditService } from "../services/auditService";
import { verifyToken, requireRole, type AuthRequest } from "../middleware/auth";

const router = Router();

router.use(verifyToken);

// Get audit trail for a specific expense
router.get("/expense/:id", async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    const auditTrail = await auditService.getExpenseAuditTrail(id);
    res.json({ auditTrail });
  } catch (error) {
    console.error("Get expense audit trail error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get user activity
router.get("/user/activity", async (req: AuthRequest, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const activities = await auditService.getUserActivity(
      req.user!.id, 
      parseInt(limit as string)
    );
    
    res.json({ activities });
  } catch (error) {
    console.error("Get user activity error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get audit log for any entity
router.get("/:entityType/:entityId", async (req: AuthRequest, res) => {
  try {
    const { entityType, entityId } = req.params;
    
    const auditLog = await auditService.getAuditLog(entityType, entityId);
    res.json({ auditLog });
  } catch (error) {
    console.error("Get audit log error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
