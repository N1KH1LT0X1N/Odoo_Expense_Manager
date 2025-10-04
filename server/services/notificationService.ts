import { db } from "../db";
import { users, expenses } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

class NotificationService {
  private notifications: Map<string, Notification[]> = new Map();

  async createNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    data?: any
  ): Promise<void> {
    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      title,
      message,
      data,
      read: false,
      createdAt: new Date()
    };

    // Store in memory (in production, use a proper database)
    if (!this.notifications.has(userId)) {
      this.notifications.set(userId, []);
    }
    
    const userNotifications = this.notifications.get(userId)!;
    userNotifications.unshift(notification);
    
    // Keep only last 100 notifications per user
    if (userNotifications.length > 100) {
      userNotifications.splice(100);
    }

    console.log(`Notification created for user ${userId}:`, notification);
  }

  async getUserNotifications(userId: string, limit: number = 20): Promise<Notification[]> {
    const userNotifications = this.notifications.get(userId) || [];
    return userNotifications.slice(0, limit);
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    const userNotifications = this.notifications.get(userId);
    if (userNotifications) {
      const notification = userNotifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
      }
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    const userNotifications = this.notifications.get(userId);
    if (userNotifications) {
      userNotifications.forEach(notification => {
        notification.read = true;
      });
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    const userNotifications = this.notifications.get(userId) || [];
    return userNotifications.filter(n => !n.read).length;
  }

  // Expense-specific notifications
  async notifyExpenseSubmitted(expenseId: string, userId: string): Promise<void> {
    const expense = await db.query.expenses.findFirst({
      where: eq(expenses.id, expenseId),
      with: {
        user: true
      }
    });

    if (!expense) return;

    await this.createNotification(
      userId,
      "expense_submitted",
      "Expense Submitted",
      `Your expense "${expense.description}" has been submitted for approval.`,
      { expenseId, amount: expense.amount, currency: expense.currency }
    );
  }

  async notifyExpenseApproved(expenseId: string, approverId: string): Promise<void> {
    const expense = await db.query.expenses.findFirst({
      where: eq(expenses.id, expenseId),
      with: {
        user: true
      }
    });

    if (!expense) return;

    await this.createNotification(
      expense.userId,
      "expense_approved",
      "Expense Approved",
      `Your expense "${expense.description}" has been approved.`,
      { expenseId, amount: expense.amount, currency: expense.currency, approverId }
    );
  }

  async notifyExpenseRejected(expenseId: string, approverId: string, reason?: string): Promise<void> {
    const expense = await db.query.expenses.findFirst({
      where: eq(expenses.id, expenseId),
      with: {
        user: true
      }
    });

    if (!expense) return;

    await this.createNotification(
      expense.userId,
      "expense_rejected",
      "Expense Rejected",
      `Your expense "${expense.description}" has been rejected.${reason ? ` Reason: ${reason}` : ''}`,
      { expenseId, amount: expense.amount, currency: expense.currency, approverId, reason }
    );
  }

  async notifyExpenseNeedsApproval(expenseId: string, approverId: string): Promise<void> {
    const expense = await db.query.expenses.findFirst({
      where: eq(expenses.id, expenseId),
      with: {
        user: true
      }
    });

    if (!expense) return;

    await this.createNotification(
      approverId,
      "expense_pending_approval",
      "Expense Needs Approval",
      `New expense "${expense.description}" from ${expense.user?.name} needs your approval.`,
      { expenseId, amount: expense.amount, currency: expense.currency, submitterId: expense.userId }
    );
  }

  async notifyReceiptUploaded(expenseId: string, userId: string): Promise<void> {
    const expense = await db.query.expenses.findFirst({
      where: eq(expenses.id, expenseId),
    });

    if (!expense) return;

    await this.createNotification(
      userId,
      "receipt_uploaded",
      "Receipt Uploaded",
      `Receipt has been uploaded for expense "${expense.description}".`,
      { expenseId }
    );
  }
}

export const notificationService = new NotificationService();
