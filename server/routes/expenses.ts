import { Router } from "express";
import { db } from "../db";
import { expenses, users, companies } from "@shared/schema";
import { verifyToken, requireRole, type AuthRequest } from "../middleware/auth";
import { eq, and, or } from "drizzle-orm";
import { currencyService } from "../services/currencyService";
import { approvalService } from "../services/approvalService";
import { notificationService } from "../services/notificationService";
import { uploadSingle } from "../middleware/upload";
import path from "path";

const router = Router();

router.use(verifyToken);

router.post("/", async (req: AuthRequest, res) => {
  try {
    const { amount, currency, category, description, date } = req.body;

    if (!amount || !category || !description || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Get user's company to determine base currency
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.user!.id),
      with: {
        company: true
      }
    });

    if (!user?.company) {
      return res.status(400).json({ message: "User company not found" });
    }

    const companyCurrency = user.company.currency || "USD";
    const submittedCurrency = currency || "USD";
    
    // Convert amount to company's base currency
    let convertedAmount = parseFloat(amount);
    if (submittedCurrency !== companyCurrency) {
      convertedAmount = await currencyService.convertCurrency(
        parseFloat(amount),
        submittedCurrency,
        companyCurrency
      );
    }

    const [expense] = await db.insert(expenses).values({
      userId: req.user!.id,
      amount: convertedAmount.toString(),
      currency: companyCurrency, // Store in company's base currency
      category,
      description,
      date: new Date(date),
      status: "pending",
    }).returning();

    // Send notification
    await notificationService.notifyExpenseSubmitted(expense.id, req.user!.id);

    res.status(201).json({ 
      expense,
      originalAmount: parseFloat(amount),
      originalCurrency: submittedCurrency,
      convertedAmount,
      companyCurrency
    });
  } catch (error) {
    console.error("Create expense error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/mine", async (req: AuthRequest, res) => {
  try {
    const userExpenses = await db.query.expenses.findMany({
      where: eq(expenses.userId, req.user!.id),
    });

    res.json({ expenses: userExpenses });
  } catch (error) {
    console.error("Get expenses error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/:id", async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { amount, currency, category, description, date } = req.body;

    const expense = await db.query.expenses.findFirst({
      where: eq(expenses.id, id),
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    if (expense.userId !== req.user!.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Check if expense is readonly (approved or rejected)
    if (expense.status === "approved" || expense.status === "rejected") {
      return res.status(400).json({ 
        message: "Cannot modify approved or rejected expenses",
        status: expense.status
      });
    }

    const [updatedExpense] = await db.update(expenses)
      .set({
        amount: amount ? amount.toString() : undefined,
        currency: currency || undefined,
        category: category || undefined,
        description: description || undefined,
        date: date ? new Date(date) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(expenses.id, id))
      .returning();

    res.json({ expense: updatedExpense });
  } catch (error) {
    console.error("Update expense error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/:id", async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const expense = await db.query.expenses.findFirst({
      where: eq(expenses.id, id),
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    if (expense.userId !== req.user!.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Check if expense is readonly (approved or rejected)
    if (expense.status === "approved" || expense.status === "rejected") {
      return res.status(400).json({ 
        message: "Cannot delete approved or rejected expenses",
        status: expense.status
      });
    }

    await db.delete(expenses).where(eq(expenses.id, id));

    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Delete expense error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/pending", requireRole("admin", "manager"), async (req: AuthRequest, res) => {
  try {
    const userCompany = await db.query.users.findFirst({
      where: eq(users.id, req.user!.id),
    });

    if (!userCompany) {
      return res.status(404).json({ message: "User not found" });
    }

    const pendingExpenses = await db.select({
      expense: expenses,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
      }
    })
      .from(expenses)
      .leftJoin(users, eq(expenses.userId, users.id))
      .where(and(
        eq(expenses.status, "pending"),
        eq(users.companyId, userCompany.companyId)
      ));

    res.json({ expenses: pendingExpenses });
  } catch (error) {
    console.error("Get pending expenses error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/:id/approve", requireRole("admin", "manager"), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status, comments } = req.body;

    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be 'approved' or 'rejected'" });
    }

    const result = await approvalService.processApproval(
      id, 
      req.user!.id, 
      status, 
      comments
    );

    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    // Send appropriate notifications
    if (result.isComplete) {
      if (status === "approved") {
        await notificationService.notifyExpenseApproved(id, req.user!.id);
      } else if (status === "rejected") {
        await notificationService.notifyExpenseRejected(id, req.user!.id);
      }
    } else if (result.nextStep && result.approvers) {
      // Notify next approvers
      for (const approver of result.approvers) {
        await notificationService.notifyExpenseNeedsApproval(id, approver.id);
      }
    }

    res.json({ 
      message: result.message,
      nextStep: result.nextStep,
      isComplete: result.isComplete,
      approvers: result.approvers
    });
  } catch (error) {
    console.error("Approve expense error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/all", requireRole("admin"), async (req: AuthRequest, res) => {
  try {
    const allExpenses = await db.select({
      expense: expenses,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
      }
    })
      .from(expenses)
      .leftJoin(users, eq(expenses.userId, users.id))
      .where(eq(users.companyId, req.user!.companyId));

    res.json({ expenses: allExpenses });
  } catch (error) {
    console.error("Get all expenses error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Upload receipt for an expense
router.post("/:id/receipt", uploadSingle, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Check if expense exists and belongs to user
    const expense = await db.query.expenses.findFirst({
      where: and(
        eq(expenses.id, id),
        eq(expenses.userId, req.user!.id)
      ),
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Check if expense is readonly (approved or rejected)
    if (expense.status === "approved" || expense.status === "rejected") {
      return res.status(400).json({ 
        message: "Cannot upload receipt for approved or rejected expenses",
        status: expense.status
      });
    }

    // Update expense with receipt URL
    const receiptUrl = `/uploads/receipts/${req.file.filename}`;
    const [updatedExpense] = await db.update(expenses)
      .set({ 
        receiptUrl,
        updatedAt: new Date(),
      })
      .where(eq(expenses.id, id))
      .returning();

    // Send notification
    await notificationService.notifyReceiptUploaded(expense.id, req.user!.id);

    res.json({ 
      expense: updatedExpense, 
      message: "Receipt uploaded successfully",
      receiptUrl 
    });
  } catch (error) {
    console.error("Upload receipt error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get receipt file
router.get("/receipt/:filename", (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), 'uploads', 'receipts', filename);
    
    // Check if file exists
    if (!require('fs').existsSync(filePath)) {
      return res.status(404).json({ message: "Receipt not found" });
    }
    
    res.sendFile(filePath);
  } catch (error) {
    console.error("Get receipt error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get approval history for an expense
router.get("/:id/history", async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    const history = await approvalService.getApprovalHistory(id);
    res.json({ history });
  } catch (error) {
    console.error("Get approval history error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
