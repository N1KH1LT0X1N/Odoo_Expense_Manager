import { Router } from "express";
import { db } from "../db";
import { approvalFlows } from "@shared/schema";
import { verifyToken, requireRole, type AuthRequest } from "../middleware/auth";
import { eq, and } from "drizzle-orm";

const router = Router();

router.use(verifyToken);
router.use(requireRole("admin"));

router.post("/", async (req: AuthRequest, res) => {
  try {
    const { 
      stepOrder, 
      requiredRole, 
      amountThreshold, 
      isSequential, 
      minApprovalPercentage, 
      approverIds 
    } = req.body;

    if (!stepOrder || !requiredRole) {
      return res.status(400).json({ message: "Step order and required role are required" });
    }

    const [flow] = await db.insert(approvalFlows).values({
      companyId: req.user!.companyId,
      stepOrder,
      requiredRole,
      amountThreshold: amountThreshold ? amountThreshold.toString() : null,
      isSequential: isSequential !== undefined ? isSequential : true,
      minApprovalPercentage: minApprovalPercentage || 100,
      approverIds: approverIds ? JSON.stringify(approverIds) : null,
    }).returning();

    res.status(201).json({ flow });
  } catch (error) {
    console.error("Create approval flow error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/", async (req: AuthRequest, res) => {
  try {
    const flows = await db.query.approvalFlows.findMany({
      where: eq(approvalFlows.companyId, req.user!.companyId),
    });

    res.json({ flows });
  } catch (error) {
    console.error("Get approval flows error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/:id", async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { stepOrder, requiredRole, amountThreshold } = req.body;

    const [updatedFlow] = await db.update(approvalFlows)
      .set({
        stepOrder: stepOrder !== undefined ? stepOrder : undefined,
        requiredRole: requiredRole || undefined,
        amountThreshold: amountThreshold !== undefined ? amountThreshold?.toString() : undefined,
      })
      .where(and(
        eq(approvalFlows.id, id),
        eq(approvalFlows.companyId, req.user!.companyId)
      ))
      .returning();

    if (!updatedFlow) {
      return res.status(404).json({ message: "Approval flow not found" });
    }

    res.json({ flow: updatedFlow });
  } catch (error) {
    console.error("Update approval flow error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/:id", async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    await db.delete(approvalFlows)
      .where(and(
        eq(approvalFlows.id, id),
        eq(approvalFlows.companyId, req.user!.companyId)
      ));

    res.json({ message: "Approval flow deleted" });
  } catch (error) {
    console.error("Delete approval flow error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
