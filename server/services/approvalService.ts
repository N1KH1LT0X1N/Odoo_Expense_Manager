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
      return { success: false, message: "Expense not found" };
    }

    // Get approval flows for this company
    const flows = await this.getApprovalFlowForExpense(expenseId);
    
    // If no approval flows are configured, use simple approval
    if (flows.length === 0) {
      return await this.processSimpleApproval(expenseId, approverId, action, comments);
    }

    // Check if this is a rejection
    if (action === "rejected") {
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

    // Record approval action
    await this.recordApprovalAction(expenseId, approverId, action, expense.approvalFlowStep || 0, comments);

    // Get current approval step
    const currentStep = expense.approvalFlowStep || 0;
    const currentFlow = flows.find(f => f.stepOrder === currentStep);

    if (!currentFlow) {
      return { success: false, message: "Invalid approval step" };
    }

    // Check if this is sequential or parallel approval
    if (currentFlow.isSequential) {
      return await this.processSequentialApproval(expenseId, flows, currentStep, approverId);
    } else {
      return await this.processParallelApproval(expenseId, flows, currentStep, approverId);
    }
  }

  private async processSequentialApproval(
    expenseId: string, 
    flows: any[], 
    currentStep: number, 
    approverId: string
  ): Promise<ApprovalResult> {
    // Move to next step
    const nextStep = currentStep + 1;
    const nextFlow = flows.find(f => f.stepOrder === nextStep);

    if (!nextFlow) {
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
        message: "Expense approved", 
        isComplete: true 
      };
    }

    // Move to next step
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
      message: `Moved to step ${nextStep}`,
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
      // Move to next step or complete
      const nextStep = currentStep + 1;
      const nextFlow = flows.find(f => f.stepOrder === nextStep);

      if (!nextFlow) {
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
          message: "Expense approved", 
          isComplete: true 
        };
      }

      // Move to next step
      await db.update(expenses)
        .set({ 
          approvalFlowStep: nextStep,
          updatedAt: new Date()
        })
        .where(eq(expenses.id, expenseId));

      const nextApprovers = await this.getApproversForStep(nextFlow);

      return {
        success: true,
        message: `Moved to step ${nextStep}`,
        nextStep,
        approvers: nextApprovers
      };
    }

    return {
      success: true,
      message: `Approval recorded. ${approvalPercentage.toFixed(1)}% approved (${minPercentage}% required)`,
      approvers
    };
  }

  private async getApproversForStep(flow: any): Promise<any[]> {
    if (flow.approverIds) {
      const approverIds = JSON.parse(flow.approverIds);
      return await db.query.users.findMany({
        where: inArray(users.id, approverIds)
      });
    }

    // Get users by role
    return await db.query.users.findMany({
      where: eq(users.role, flow.requiredRole)
    });
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
