import { db } from "../db";
import { approvalHistory, expenses, users } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  userName: string;
  details: any;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  async logAction(
    action: string,
    entityType: string,
    entityId: string,
    userId: string,
    details: any = {},
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      // Get user info
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        console.error(`User not found for audit log: ${userId}`);
        return;
      }

      // Log to approval history for expense-related actions
      if (entityType === "expense" && ["approved", "rejected", "submitted", "updated"].includes(action)) {
        await db.insert(approvalHistory).values({
          expenseId: entityId,
          approverId: userId,
          action: action,
          stepOrder: details.stepOrder || 0,
          comments: details.comments || null,
        });
      }

      // In a real application, you would also log to a dedicated audit table
      console.log(`AUDIT: ${action} on ${entityType} ${entityId} by ${user.name} (${user.email})`, {
        details,
        ipAddress,
        userAgent,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Failed to log audit action:", error);
    }
  }

  async getAuditLog(entityType: string, entityId: string): Promise<AuditLog[]> {
    try {
      if (entityType === "expense") {
        const history = await db.query.approvalHistory.findMany({
          where: eq(approvalHistory.expenseId, entityId),
          with: {
            approver: true
          },
          orderBy: [desc(approvalHistory.createdAt)]
        });

        return history.map(entry => ({
          id: entry.id,
          action: entry.action,
          entityType: "expense",
          entityId: entry.expenseId,
          userId: entry.approverId,
          userName: entry.approver?.name || "Unknown",
          details: {
            stepOrder: entry.stepOrder,
            comments: entry.comments
          },
          timestamp: entry.createdAt
        }));
      }

      return [];
    } catch (error) {
      console.error("Failed to get audit log:", error);
      return [];
    }
  }

  async getExpenseAuditTrail(expenseId: string): Promise<any[]> {
    try {
      const expense = await db.query.expenses.findFirst({
        where: eq(expenses.id, expenseId),
        with: {
          user: true,
          approver: true
        }
      });

      if (!expense) {
        return [];
      }

      const auditLog = await this.getAuditLog("expense", expenseId);
      
      // Add expense creation as first entry
      const creationEntry = {
        id: `creation-${expense.id}`,
        action: "created",
        entityType: "expense",
        entityId: expense.id,
        userId: expense.userId,
        userName: expense.user?.name || "Unknown",
        details: {
          amount: expense.amount,
          currency: expense.currency,
          category: expense.category,
          description: expense.description
        },
        timestamp: expense.createdAt
      };

      return [creationEntry, ...auditLog];
    } catch (error) {
      console.error("Failed to get expense audit trail:", error);
      return [];
    }
  }

  async getUserActivity(userId: string, limit: number = 50): Promise<AuditLog[]> {
    try {
      // Get user's expenses and their approval history
      const userExpenses = await db.query.expenses.findMany({
        where: eq(expenses.userId, userId),
        with: {
          approvalHistory: {
            with: {
              approver: true
            },
            orderBy: [desc(approvalHistory.createdAt)]
          }
        },
        orderBy: [desc(expenses.createdAt)],
        limit
      });

      const activities: AuditLog[] = [];

      for (const expense of userExpenses) {
        // Add expense creation
        activities.push({
          id: `creation-${expense.id}`,
          action: "created",
          entityType: "expense",
          entityId: expense.id,
          userId: expense.userId,
          userName: "You",
          details: {
            amount: expense.amount,
            currency: expense.currency,
            category: expense.category,
            description: expense.description
          },
          timestamp: expense.createdAt
        });

        // Add approval history
        for (const history of expense.approvalHistory) {
          activities.push({
            id: history.id,
            action: history.action,
            entityType: "expense",
            entityId: expense.id,
            userId: history.approverId,
            userName: history.approver?.name || "Unknown",
            details: {
              stepOrder: history.stepOrder,
              comments: history.comments
            },
            timestamp: history.createdAt
          });
        }
      }

      return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      console.error("Failed to get user activity:", error);
      return [];
    }
  }
}

export const auditService = new AuditService();
