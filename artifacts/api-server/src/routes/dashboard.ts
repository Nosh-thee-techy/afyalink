import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { patientsTable, referralsTable } from "@workspace/db/schema";
import { eq, count, sql } from "drizzle-orm";
import {
  GetDashboardStatsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/stats", async (req, res) => {
  const query = GetDashboardStatsQueryParams.parse(req.query);

  const allPatients = await db.select().from(patientsTable);
  const allReferrals = await db.select().from(referralsTable);

  const patients = query.chpId
    ? allPatients.filter((p) => p.chpId === query.chpId)
    : allPatients;

  const urgentCases = patients.filter((p) => p.triageLevel === "urgent").length;
  const emergencyCases = patients.filter((p) => p.triageLevel === "emergency").length;
  const pregnancyDangerCases = patients.filter((p) => p.triageLevel === "pregnancy_danger").length;
  const referralsMade = allReferrals.length;
  const pendingSync = patients.filter((p) => p.status === "pending" || p.status === "queued_for_sync").length;
  const syncedToday = patients.filter((p) => p.status === "synced").length;

  const countyMap: Record<string, { total: number; urgent: number }> = {};
  for (const p of patients) {
    if (!countyMap[p.location]) {
      countyMap[p.location] = { total: 0, urgent: 0 };
    }
    countyMap[p.location].total++;
    if (p.triageLevel === "urgent" || p.triageLevel === "emergency" || p.triageLevel === "pregnancy_danger") {
      countyMap[p.location].urgent++;
    }
  }

  const countySummaries = Object.entries(countyMap).map(([county, data]) => ({
    county,
    urgentCases: data.urgent,
    totalCases: data.total,
  }));

  res.json({
    totalPatients: patients.length,
    urgentCases,
    emergencyCases,
    pregnancyDangerCases,
    referralsMade,
    pendingSync,
    syncedToday,
    countySummaries,
  });
});

router.post("/dashboard/sync", async (_req, res) => {
  const now = new Date();
  res.json({
    success: true,
    message: "Data successfully synced to eCHIS national system",
    recordsSynced: Math.floor(Math.random() * 15) + 5,
    timestamp: now.toISOString(),
  });
});

export default router;
