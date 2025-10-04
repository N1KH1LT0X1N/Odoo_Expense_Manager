import { Router } from "express";
import bcrypt from "bcrypt";
import { db } from "../db";
import { users } from "@shared/schema";
import { verifyToken, requireRole, type AuthRequest } from "../middleware/auth";
import { eq, and } from "drizzle-orm";

const router = Router();

router.use(verifyToken);

router.post("/", requireRole("admin"), async (req: AuthRequest, res) => {
  try {
    const { name, email, password, role, managerId } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [newUser] = await db.insert(users).values({
      name,
      email,
      passwordHash,
      role,
      companyId: req.user!.companyId,
      managerId: managerId || null,
    }).returning();

    const { passwordHash: _, ...userWithoutPassword } = newUser;

    res.status(201).json({ user: userWithoutPassword });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/", requireRole("admin", "manager"), async (req: AuthRequest, res) => {
  try {
    const companyUsers = await db.query.users.findMany({
      where: eq(users.companyId, req.user!.companyId),
    });

    const usersWithoutPasswords = companyUsers.map(({ passwordHash, ...user }) => user);

    res.json({ users: usersWithoutPasswords });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/:id/role", requireRole("admin"), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !["admin", "manager", "employee"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const [updatedUser] = await db.update(users)
      .set({ role })
      .where(and(
        eq(users.id, id),
        eq(users.companyId, req.user!.companyId)
      ))
      .returning();

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const { passwordHash: _, ...userWithoutPassword } = updatedUser;

    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
