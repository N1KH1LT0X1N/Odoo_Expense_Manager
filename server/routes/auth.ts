import { Router } from "express";
import bcrypt from "bcrypt";
import { db } from "../db";
import { users, companies, type InsertUser, type InsertCompany } from "@shared/schema";
import { generateToken } from "../middleware/auth";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, companyName } = req.body;

    if (!name || !email || !password || !companyName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [company] = await db.insert(companies).values({
      name: companyName,
      currency: "USD",
    }).returning();

    const [user] = await db.insert(users).values({
      name,
      email,
      passwordHash,
      role: "admin",
      companyId: company.id,
    }).returning();

    const token = generateToken(user);

    const { passwordHash: _, ...userWithoutPassword } = user;

    res.status(201).json({ 
      user: userWithoutPassword, 
      token,
      message: "Company and admin user created successfully" 
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    const { passwordHash: _, ...userWithoutPassword } = user;

    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const jwt = require("jsonwebtoken");
    const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    const user = await db.query.users.findFirst({
      where: eq(users.id, decoded.id),
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
});

export default router;
