import type { Express } from "express";
import { createServer, type Server } from "http";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import expenseRoutes from "./routes/expenses";
import approvalFlowRoutes from "./routes/approval-flows";
import currencyRoutes from "./routes/currency";
import countryRoutes from "./routes/countries";
import auditRoutes from "./routes/audit";
import notificationRoutes from "./routes/notifications";

export async function registerRoutes(app: Express): Promise<Server> {
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/expenses", expenseRoutes);
  app.use("/api/approval-flows", approvalFlowRoutes);
  app.use("/api/currency", currencyRoutes);
  app.use("/api/countries", countryRoutes);
  app.use("/api/audit", auditRoutes);
  app.use("/api/notifications", notificationRoutes);

  const httpServer = createServer(app);

  return httpServer;
}
