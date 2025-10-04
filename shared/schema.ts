import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, pgEnum, integer, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const roleEnum = pgEnum("role", ["admin", "manager", "employee"]);
export const expenseStatusEnum = pgEnum("expense_status", ["pending", "approved", "rejected"]);
export const categoryEnum = pgEnum("category", ["travel", "food", "office", "equipment", "other"]);

export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  currency: text("currency").notNull().default("USD"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("employee"),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  managerId: varchar("manager_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const expenses = pgTable("expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  category: categoryEnum("category").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  status: expenseStatusEnum("status").notNull().default("pending"),
  approverId: varchar("approver_id").references(() => users.id),
  approvalFlowStep: integer("approval_flow_step").default(0),
  receiptUrl: text("receipt_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const approvalFlows = pgTable("approval_flows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  stepOrder: integer("step_order").notNull(),
  requiredRole: roleEnum("required_role").notNull(),
  amountThreshold: decimal("amount_threshold", { precision: 10, scale: 2 }),
  isSequential: boolean("is_sequential").notNull().default(true),
  minApprovalPercentage: integer("min_approval_percentage").default(100),
  approverIds: text("approver_ids"), // JSON array of user IDs
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const approvalHistory = pgTable("approval_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  expenseId: varchar("expense_id").notNull().references(() => expenses.id),
  approverId: varchar("approver_id").notNull().references(() => users.id),
  action: text("action").notNull(), // "approved", "rejected", "pending"
  stepOrder: integer("step_order").notNull(),
  comments: text("comments"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCompanySchema = createInsertSchema(companies);
export const selectCompanySchema = createSelectSchema(companies);

export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  passwordHash: z.string().min(8),
}).omit({ id: true, createdAt: true });

export const selectUserSchema = createSelectSchema(users).omit({ passwordHash: true });

export const insertExpenseSchema = createInsertSchema(expenses).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  status: true,
  approverId: true,
  approvalFlowStep: true,
});

export const selectExpenseSchema = createSelectSchema(expenses);

export const insertApprovalFlowSchema = createInsertSchema(approvalFlows).omit({ 
  id: true, 
  createdAt: true 
});

export const selectApprovalFlowSchema = createSelectSchema(approvalFlows);

export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type PublicUser = z.infer<typeof selectUserSchema>;

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;

export type ApprovalFlow = typeof approvalFlows.$inferSelect;
export type InsertApprovalFlow = z.infer<typeof insertApprovalFlowSchema>;

// Define relationships
export const companiesRelations = relations(companies, ({ many }) => ({
  users: many(users),
  expenses: many(expenses),
  approvalFlows: many(approvalFlows),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
  manager: one(users, {
    fields: [users.managerId],
    references: [users.id],
  }),
  employees: many(users),
  expenses: many(expenses),
}));

export const expensesRelations = relations(expenses, ({ one, many }) => ({
  user: one(users, {
    fields: [expenses.userId],
    references: [users.id],
  }),
  approver: one(users, {
    fields: [expenses.approverId],
    references: [users.id],
  }),
  approvalHistory: many(approvalHistory),
}));

export const approvalFlowsRelations = relations(approvalFlows, ({ one }) => ({
  company: one(companies, {
    fields: [approvalFlows.companyId],
    references: [companies.id],
  }),
}));

export const approvalHistoryRelations = relations(approvalHistory, ({ one }) => ({
  expense: one(expenses, {
    fields: [approvalHistory.expenseId],
    references: [expenses.id],
  }),
  approver: one(users, {
    fields: [approvalHistory.approverId],
    references: [users.id],
  }),
}));
