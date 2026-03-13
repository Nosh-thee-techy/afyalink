import { pgTable, text, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const referralsTable = pgTable("referrals", {
  id: text("id").primaryKey(),
  patientId: text("patient_id").notNull(),
  chpId: text("chp_id").notNull(),
  facilityName: text("facility_name").notNull(),
  facilityLevel: text("facility_level").notNull(),
  distanceKm: real("distance_km").notNull(),
  county: text("county").notNull(),
  urgency: text("urgency").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReferralSchema = createInsertSchema(referralsTable).omit({
  createdAt: true,
});

export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Referral = typeof referralsTable.$inferSelect;
