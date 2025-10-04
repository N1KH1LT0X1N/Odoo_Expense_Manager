import type { Express } from "express";
import { createServer, type Server } from "http";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import expenseRoutes from "./routes/expenses";

export async function registerRoutes(app: Express): Promise<Server> {
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/expenses", expenseRoutes);

  const httpServer = createServer(app);

  return httpServer;
}
