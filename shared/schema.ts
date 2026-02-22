import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, timestamp, boolean, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().default("New Chat"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const productLogs = pgTable("product_logs", {
  id: serial("id").primaryKey(),
  deviceId: varchar("device_id", { length: 64 }).notNull(),
  date: date("date").notNull(),
  productType: text("product_type").notNull(),
  brand: varchar("brand", { length: 60 }),
  scented: boolean("scented").notNull().default(false),
  notes: varchar("notes", { length: 500 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertProductLogSchema = createInsertSchema(productLogs)
  .pick({
    date: true,
    productType: true,
    brand: true,
    scented: true,
    notes: true,
  })
  .extend({
    date: z.string().min(1, "Date is required"),
    productType: z.enum(["Pad", "Pantyliner", "Tampon", "Cup", "Period underwear", "Other"]),
    brand: z.string().max(60).optional().nullable(),
    scented: z.boolean().default(false),
    notes: z.string().max(500).optional().nullable(),
  });

export type InsertProductLog = z.infer<typeof insertProductLogSchema>;
export type ProductLog = typeof productLogs.$inferSelect;
