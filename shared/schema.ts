import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, timestamp, boolean, date, jsonb } from "drizzle-orm/pg-core";
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

export const partnerInvites = pgTable("partner_invites", {
  id: serial("id").primaryKey(),
  primaryDeviceId: varchar("primary_device_id", { length: 64 }).notNull(),
  inviteCodeHash: varchar("invite_code_hash", { length: 128 }).notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const partnerLinks = pgTable("partner_links", {
  id: serial("id").primaryKey(),
  primaryDeviceId: varchar("primary_device_id", { length: 64 }).notNull(),
  partnerDeviceId: varchar("partner_device_id", { length: 64 }).notNull(),
  partnerToken: varchar("partner_token", { length: 128 }).notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  revokedAt: timestamp("revoked_at"),
});

export const partnerSharingSettings = pgTable("partner_sharing_settings", {
  id: serial("id").primaryKey(),
  primaryDeviceId: varchar("primary_device_id", { length: 64 }).notNull().unique(),
  shareCyclePhase: boolean("share_cycle_phase").notNull().default(true),
  shareNextPeriodWindow: boolean("share_next_period_window").notNull().default(true),
  shareFertileWindow: boolean("share_fertile_window").notNull().default(false),
  shareOvulationEstimate: boolean("share_ovulation_estimate").notNull().default(false),
  shareMoodSummary: boolean("share_mood_summary").notNull().default(false),
  shareEnergySummary: boolean("share_energy_summary").notNull().default(false),
  shareTipsForPartner: boolean("share_tips_for_partner").notNull().default(true),
  shareNotifications: boolean("share_notifications").notNull().default(false),
  precisionLevel: text("precision_level").notNull().default("low"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const cycleSnapshots = pgTable("cycle_snapshots", {
  id: serial("id").primaryKey(),
  deviceId: varchar("device_id", { length: 64 }).notNull().unique(),
  phase: text("phase"),
  phaseLabel: text("phase_label"),
  nextPeriodFrom: date("next_period_from"),
  nextPeriodTo: date("next_period_to"),
  nextPeriodConfidence: text("next_period_confidence"),
  fertileWindowFrom: date("fertile_window_from"),
  fertileWindowTo: date("fertile_window_to"),
  ovulationWindowFrom: date("ovulation_window_from"),
  ovulationWindowTo: date("ovulation_window_to"),
  moodLevel: text("mood_level"),
  moodMessage: text("mood_message"),
  energyLevel: text("energy_level"),
  energyMessage: text("energy_message"),
  tips: text("tips").array(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const partnerAuditLog = pgTable("partner_audit_log", {
  id: serial("id").primaryKey(),
  actorDeviceId: varchar("actor_device_id", { length: 64 }).notNull(),
  action: text("action").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPartnerInviteSchema = createInsertSchema(partnerInvites).pick({
  primaryDeviceId: true,
  inviteCodeHash: true,
  expiresAt: true,
});

export const updatePartnerSettingsSchema = z.object({
  shareCyclePhase: z.boolean().optional(),
  shareNextPeriodWindow: z.boolean().optional(),
  shareFertileWindow: z.boolean().optional(),
  shareOvulationEstimate: z.boolean().optional(),
  shareMoodSummary: z.boolean().optional(),
  shareEnergySummary: z.boolean().optional(),
  shareTipsForPartner: z.boolean().optional(),
  shareNotifications: z.boolean().optional(),
  precisionLevel: z.enum(["low", "medium"]).optional(),
});

export const insertCycleSnapshotSchema = z.object({
  phase: z.string().nullable().optional(),
  phaseLabel: z.string().nullable().optional(),
  nextPeriodFrom: z.string().nullable().optional(),
  nextPeriodTo: z.string().nullable().optional(),
  nextPeriodConfidence: z.string().nullable().optional(),
  fertileWindowFrom: z.string().nullable().optional(),
  fertileWindowTo: z.string().nullable().optional(),
  ovulationWindowFrom: z.string().nullable().optional(),
  ovulationWindowTo: z.string().nullable().optional(),
  moodLevel: z.string().nullable().optional(),
  moodMessage: z.string().nullable().optional(),
  energyLevel: z.string().nullable().optional(),
  energyMessage: z.string().nullable().optional(),
  tips: z.array(z.string()).nullable().optional(),
});

export type PartnerInvite = typeof partnerInvites.$inferSelect;
export type PartnerLink = typeof partnerLinks.$inferSelect;
export type PartnerSharingSettings = typeof partnerSharingSettings.$inferSelect;
export type CycleSnapshot = typeof cycleSnapshots.$inferSelect;
export type PartnerAuditLogEntry = typeof partnerAuditLog.$inferSelect;
export type UpdatePartnerSettings = z.infer<typeof updatePartnerSettingsSchema>;
export type InsertCycleSnapshot = z.infer<typeof insertCycleSnapshotSchema>;
