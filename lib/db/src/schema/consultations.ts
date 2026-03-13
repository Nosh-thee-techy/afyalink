import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const consultationsTable = pgTable("consultations", {
  id: text("id").primaryKey(),
  patientId: text("patient_id").notNull(),
  chpId: text("chp_id").notNull(),
  notes: text("notes"),
  hasVideo: boolean("has_video").notNull().default(false),
  hasSmsAlert: boolean("has_sms_alert").notNull().default(false),
  syncStatus: text("sync_status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertConsultationSchema = createInsertSchema(consultationsTable).omit({
  createdAt: true,
});

export type InsertConsultation = z.infer<typeof insertConsultationSchema>;
export type Consultation = typeof consultationsTable.$inferSelect;
