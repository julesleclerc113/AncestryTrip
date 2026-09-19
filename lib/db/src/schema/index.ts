// Export your models here. Add one export per file
// export * from "./posts";
//
// Each model/table should ideally be split into different files.
// Each model/table should define a Drizzle table, insert schema, and types:
//
//   import { pgTable, text, serial } from "drizzle-orm/pg-core";
//   import { createInsertSchema } from "drizzle-zod";
//   import { z } from "zod/v4";
//
//   export const postsTable = pgTable("posts", {
//     id: serial("id").primaryKey(),
//     title: text("title").notNull(),
//   });
//
//   export const insertPostSchema = createInsertSchema(postsTable).omit({ id: true });
//   export type InsertPost = z.infer<typeof insertPostSchema>;
//   export type Post = typeof postsTable.$inferSelect;

import { createInsertSchema } from "drizzle-zod";
import {
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const customersTable = pgTable("customers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tripRequestsTable = pgTable("trip_requests", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id"),
  input: jsonb("input").notNull(),
  preview: jsonb("preview").notNull(),
  aiModelOutput: jsonb("ai_model_output"),
  aiGeneratedAt: timestamp("ai_generated_at", { withTimezone: true }),
  aiGenerationStatus: text("ai_generation_status").notNull().default("not_requested"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id"),
  tripRequestId: integer("trip_request_id"),
  product: text("product").notNull(),
  amountCents: integer("amount_cents").notNull(),
  status: text("status").notNull().default("pending"),
  stripeSessionId: text("stripe_session_id").unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const reportsTable = pgTable("reports", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id"),
  token: text("token").notNull().unique(),
  product: text("product").notNull(),
  status: text("status").notNull().default("ready"),
  content: jsonb("content").notNull(),
  aiModelOutput: jsonb("ai_model_output"),
  aiGeneratedAt: timestamp("ai_generated_at", { withTimezone: true }),
  aiGenerationStatus: text("ai_generation_status").notNull().default("not_requested"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const aiUsageTable = pgTable(
  "ai_usage",
  {
    id: serial("id").primaryKey(),
    usageKey: text("usage_key").notNull(),
    requestType: text("request_type").notNull(),
    windowStarted: timestamp("window_started", { withTimezone: true }).notNull(),
    requestCount: integer("request_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    usageWindowKey: uniqueIndex("ai_usage_window_key").on(
      table.usageKey,
      table.requestType,
      table.windowStarted,
    ),
  }),
);

export const reportItemsTable = pgTable("report_items", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id").notNull(),
  section: text("section").notNull(),
  content: text("content").notNull(),
});

export const contentPagesTable = pgTable("content_pages", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
});

export const analyticsEventsTable = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  source: text("source"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const supportTicketsTable = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const operatorRunsTable = pgTable("operator_runs", {
  id: serial("id").primaryKey(),
  task: text("task").notNull(),
  status: text("status").notNull(),
  summary: text("summary"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const marketingQueueTable = pgTable("marketing_queue", {
  id: serial("id").primaryKey(),
  channel: text("channel").notNull(),
  content: text("content").notNull(),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCustomerSchema = createInsertSchema(customersTable).omit({ id: true, createdAt: true });
export const insertTripRequestSchema = createInsertSchema(tripRequestsTable).omit({ id: true, createdAt: true });
export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true });
export const insertReportSchema = createInsertSchema(reportsTable).omit({ id: true, createdAt: true });
export const insertSupportTicketSchema = createInsertSchema(supportTicketsTable).omit({ id: true, createdAt: true });

export type Customer = typeof customersTable.$inferSelect;
export type TripRequest = typeof tripRequestsTable.$inferSelect;
export type Order = typeof ordersTable.$inferSelect;
export type Report = typeof reportsTable.$inferSelect;
export type SupportTicket = typeof supportTicketsTable.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type InsertTripRequest = z.infer<typeof insertTripRequestSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;