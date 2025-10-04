import type { Express } from "express";
import { createServer, type Server } from "http";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import expenseRoutes from "./routes/expenses";
import approvalFlowRoutes from "./routes/approval-flows";

export async function registerRoutes(app: Express): Promise<Server> {
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/expenses", expenseRoutes);
  app.use("/api/approval-flows", approvalFlowRoutes);

  const httpServer = createServer(app);

  return httpServer;
}
