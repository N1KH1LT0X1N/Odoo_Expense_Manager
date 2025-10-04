import { db } from "../db";
import { expenses, approvalFlows, approvalHistory, users } from "@shared/schema";
import { eq, and, desc, inArray } from "drizzle-orm";

export interface ApprovalResult {
  success: boolean;
  message: string;
  nextStep?: number;
  isComplete?: boolean;
  approvers?: any[];
}

export class ApprovalService {
  async getApprovalFlowForExpense(expenseId: string): Promise<any[]> {
    const expense = await db.query.expenses.findFirst({
      where: eq(expenses.id, expenseId),
      with: {
        user: {
          with: {
            company: true
          }
        }
      }
    });

    if (!expense?.user || !expense.user.company) {
      throw new Error("Expense or company not found");
    }

    const flows = await db.query.approvalFlows.findMany({
      where: eq(approvalFlows.companyId, expense.user.company.id),
      orderBy: [approvalFlows.stepOrder]
    });

    return flows;
  }

  private async processSimpleApproval(
    expenseId: string, 
    approverId: string, 
    action: "approved" | "rejected",
    comments?: string
  ): Promise<ApprovalResult> {
    // Record approval action
    await this.recordApprovalAction(expenseId, approverId, action, 0, comments);

    if (action === "rejected") {
      await db.update(expenses)
        .set({ 
          status: "rejected",
          approverId,
          updatedAt: new Date()
        })
        .where(eq(expenses.id, expenseId));

      return { 
        success: true, 
        message: "Expense rejected", 
        isComplete: true 
      };
    }

    // Approve the expense
    await db.update(expenses)
      .set({ 
        status: "approved",
        approverId,
        updatedAt: new Date()
      })
      .where(eq(expenses.id, expenseId));

    return { 
      success: true, 
      message: "Expense approved", 
      isComplete: true 
    };
  }

  async processApproval(
    expenseId: string, 
    approverId: string, 
    action: "approved" | "rejected",
    comments?: string
  ): Promise<ApprovalResult> {
    console.log(`[ApprovalService] Processing approval: expenseId=${expenseId}, approverId=${approverId}, action=${action}`);
    
    const expense = await db.query.expenses.findFirst({
      where: eq(expenses.id, expenseId),
      with: {
        user: {
          with: {
            company: true
          }
        }
      }
    });

    if (!expense) {
      console.error(`[ApprovalService] Expense not found: ${expenseId}`);
      return { success: false, message: "Expense not found" };
    }

    console.log(`[ApprovalService] Expense status: ${expense.status}, current step: ${expense.approvalFlowStep}`);

    if (expense.status !== "pending") {
      console.warn(`[ApprovalService] Expense already ${expense.status}`);
      return { success: false, message: `Expense is already ${expense.status}` };
    }

    // Get approval flows for this company
    const flows = await this.getApprovalFlowForExpense(expenseId);
    console.log(`[ApprovalService] Found ${flows.length} approval flows`);
    
    // If no approval flows are configured, use simple approval
    if (flows.length === 0) {
      console.log(`[ApprovalService] No flows configured, using simple approval`);
      return await this.processSimpleApproval(expenseId, approverId, action, comments);
    }

    // Check if this is a rejection
    if (action === "rejected") {
      console.log(`[ApprovalService] Processing rejection`);
      await this.recordApprovalAction(expenseId, approverId, action, expense.approvalFlowStep || 0, comments);
      
      await db.update(expenses)
        .set({ 
          status: "rejected",
          approverId,
          updatedAt: new Date()
        })
        .where(eq(expenses.id, expenseId));

      return { 
        success: true, 
        message: "Expense rejected", 
        isComplete: true 
      };
    }

    // Get current approval step - start from first step if not set
    let currentStep = expense.approvalFlowStep || 0;
    
    // If currentStep is 0 and flows exist, start from the first flow's stepOrder
    if (currentStep === 0 && flows.length > 0) {
      currentStep = flows[0].stepOrder;
      console.log(`[ApprovalService] Initializing to first step: ${currentStep}`);
      // Update the expense to reflect the current step
      await db.update(expenses)
        .set({ 
          approvalFlowStep: currentStep,
          updatedAt: new Date()
        })
        .where(eq(expenses.id, expenseId));
    }

    const currentFlow = flows.find(f => f.stepOrder === currentStep);

    if (!currentFlow) {
      console.error(`[ApprovalService] Invalid approval step: ${currentStep}`);
      return { success: false, message: `Invalid approval step: ${currentStep}` };
    }

    console.log(`[ApprovalService] Current flow step ${currentStep}: requiredRole=${currentFlow.requiredRole}, isSequential=${currentFlow.isSequential}`);

    // Verify the approver has the required role for this step
    const approver = await db.query.users.findFirst({
      where: eq(users.id, approverId)
    });

    if (!approver) {
      console.error(`[ApprovalService] Approver not found: ${approverId}`);
      return { success: false, message: "Approver not found" };
    }

    console.log(`[ApprovalService] Approver role: ${approver.role}`);

    // Check if approver has required role
    if (currentFlow.requiredRole && approver.role !== currentFlow.requiredRole && approver.role !== "admin") {
      console.warn(`[ApprovalService] Approver role mismatch. Required: ${currentFlow.requiredRole}, Got: ${approver.role}`);
      return { 
        success: false, 
        message: `This step requires ${currentFlow.requiredRole} role` 
      };
    }

    // Record approval action
    await this.recordApprovalAction(expenseId, approverId, action, currentStep, comments);

    // Check if this is sequential or parallel approval
    if (currentFlow.isSequential) {
      console.log(`[ApprovalService] Processing sequential approval`);
      return await this.processSequentialApproval(expenseId, flows, currentStep, approverId);
    } else {
      console.log(`[ApprovalService] Processing parallel approval`);
      return await this.processParallelApproval(expenseId, flows, currentStep, approverId);
    }
  }

  private async processSequentialApproval(
    expenseId: string, 
    flows: any[], 
    currentStep: number, 
    approverId: string
  ): Promise<ApprovalResult> {
    // Find the current step index in the flows array
    const currentIndex = flows.findIndex(f => f.stepOrder === currentStep);
    
    if (currentIndex === -1) {
      return { success: false, message: "Current step not found in flows" };
    }

    // Check if there's a next step
    if (currentIndex + 1 >= flows.length) {
      // No more steps, approve the expense
      await db.update(expenses)
        .set({ 
          status: "approved",
          approverId,
          updatedAt: new Date()
        })
        .where(eq(expenses.id, expenseId));

      return { 
        success: true, 
        message: "Expense approved - all steps completed", 
        isComplete: true 
      };
    }

    // Move to next step
    const nextFlow = flows[currentIndex + 1];
    const nextStep = nextFlow.stepOrder;

    await db.update(expenses)
      .set({ 
        approvalFlowStep: nextStep,
        updatedAt: new Date()
      })
      .where(eq(expenses.id, expenseId));

    // Get approvers for next step
    const approvers = await this.getApproversForStep(nextFlow);

    return {
      success: true,
      message: `Approval recorded. Moving to step ${nextStep} (${nextFlow.requiredRole} approval required)`,
      nextStep,
      approvers
    };
  }

  private async processParallelApproval(
    expenseId: string, 
    flows: any[], 
    currentStep: number, 
    approverId: string
  ): Promise<ApprovalResult> {
    const currentFlow = flows.find(f => f.stepOrder === currentStep);
    
    if (!currentFlow) {
      return { success: false, message: "Invalid approval step" };
    }

    // Get all approvers for this step
    const approvers = await this.getApproversForStep(currentFlow);
    
    // Get approval history for this step
    const approvals = await db.query.approvalHistory.findMany({
      where: and(
        eq(approvalHistory.expenseId, expenseId),
        eq(approvalHistory.stepOrder, currentStep),
        eq(approvalHistory.action, "approved")
      )
    });

    const rejections = await db.query.approvalHistory.findMany({
      where: and(
        eq(approvalHistory.expenseId, expenseId),
        eq(approvalHistory.stepOrder, currentStep),
        eq(approvalHistory.action, "rejected")
      )
    });

    // Check if any rejection exists
    if (rejections.length > 0) {
      await db.update(expenses)
        .set({ 
          status: "rejected",
          approverId,
          updatedAt: new Date()
        })
        .where(eq(expenses.id, expenseId));

      return { 
        success: true, 
        message: "Expense rejected by parallel approver", 
        isComplete: true 
      };
    }

    // Check if minimum approval percentage is met
    const minPercentage = currentFlow.minApprovalPercentage || 100;
    const approvalPercentage = (approvals.length / approvers.length) * 100;

    if (approvalPercentage >= minPercentage) {
      // Find the current step index in the flows array
      const currentIndex = flows.findIndex(f => f.stepOrder === currentStep);
      
      // Check if there's a next step
      if (currentIndex + 1 >= flows.length) {
        // No more steps, approve the expense
        await db.update(expenses)
          .set({ 
            status: "approved",
            approverId,
            updatedAt: new Date()
          })
          .where(eq(expenses.id, expenseId));

        return { 
          success: true, 
          message: "Expense approved - all parallel approvals completed", 
          isComplete: true 
        };
      }

      // Move to next step
      const nextFlow = flows[currentIndex + 1];
      const nextStep = nextFlow.stepOrder;

      await db.update(expenses)
        .set({ 
          approvalFlowStep: nextStep,
          updatedAt: new Date()
        })
        .where(eq(expenses.id, expenseId));

      const nextApprovers = await this.getApproversForStep(nextFlow);

      return {
        success: true,
        message: `Parallel approval threshold met (${approvalPercentage.toFixed(1)}%). Moving to step ${nextStep}`,
        nextStep,
        approvers: nextApprovers
      };
    }

    return {
      success: true,
      message: `Approval recorded. ${approvals.length}/${approvers.length} approved (${approvalPercentage.toFixed(1)}% of ${minPercentage}% required)`,
      approvers
    };
  }

  private async getApproversForStep(flow: any): Promise<any[]> {
    // If specific approvers are defined, use them
    if (flow.approverIds) {
      try {
        const approverIds = JSON.parse(flow.approverIds);
        if (approverIds && approverIds.length > 0) {
          return await db.query.users.findMany({
            where: inArray(users.id, approverIds)
          });
        }
      } catch (error) {
        console.error("Error parsing approverIds:", error);
      }
    }

    // Otherwise, get all users with the required role in the same company
    if (flow.requiredRole) {
      const approvers = await db.query.users.findMany({
        where: and(
          eq(users.role, flow.requiredRole),
          eq(users.companyId, flow.companyId)
        )
      });
      return approvers;
    }

    return [];
  }

  private async recordApprovalAction(
    expenseId: string, 
    approverId: string, 
    action: string, 
    stepOrder: number, 
    comments?: string
  ): Promise<void> {
    await db.insert(approvalHistory).values({
      expenseId,
      approverId,
      action,
      stepOrder,
      comments
    });
  }

  async getApprovalHistory(expenseId: string): Promise<any[]> {
    return await db.query.approvalHistory.findMany({
      where: eq(approvalHistory.expenseId, expenseId),
      with: {
        approver: true
      },
      orderBy: [desc(approvalHistory.createdAt)]
    });
  }
}

export const approvalService = new ApprovalService();
