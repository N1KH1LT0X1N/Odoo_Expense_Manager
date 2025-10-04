import { Router } from "express";
import { db } from "../db";
import { expenses, users } from "@shared/schema";
import { verifyToken, requireRole, type AuthRequest } from "../middleware/auth";
import { eq, and, or } from "drizzle-orm";

const router = Router();

router.use(verifyToken);

router.post("/", async (req: AuthRequest, res) => {
  try {
    const { amount, currency, category, description, date } = req.body;

    if (!amount || !category || !description || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const [expense] = await db.insert(expenses).values({
      userId: req.user!.id,
      amount: amount.toString(),
      currency: currency || "USD",
      category,
      description,
      date: new Date(date),
      status: "pending",
    }).returning();

    res.status(201).json({ expense });
  } catch (error) {
    console.error("Create expense error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/mine", async (req: AuthRequest, res) => {
  try {
    const userExpenses = await db.query.expenses.findMany({
      where: eq(expenses.userId, req.user!.id),
      with: {
        userId: true,
      },
    });

    res.json({ expenses: userExpenses });
  } catch (error) {
    console.error("Get expenses error:", error);
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
    const { status } = req.body;

    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const expense = await db.query.expenses.findFirst({
      where: eq(expenses.id, id),
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const expenseUser = await db.query.users.findFirst({
      where: eq(users.id, expense.userId),
    });

    if (!expenseUser || expenseUser.companyId !== req.user!.companyId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const [updatedExpense] = await db.update(expenses)
      .set({ 
        status,
        approverId: req.user!.id,
        updatedAt: new Date(),
      })
      .where(eq(expenses.id, id))
      .returning();

    res.json({ expense: updatedExpense });
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

export default router;
