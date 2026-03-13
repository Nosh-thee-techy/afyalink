import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { referralsTable } from "@workspace/db/schema";
import {
  ListReferralsResponse,
  CreateReferralBody,
} from "@workspace/api-zod";
import { randomUUID } from "crypto";

const router: IRouter = Router();

router.get("/referrals", async (_req, res) => {
  const referrals = await db
    .select()
    .from(referralsTable)
    .orderBy(referralsTable.createdAt);
  res.json(referrals);
});

router.post("/referrals", async (req, res) => {
  const body = CreateReferralBody.parse(req.body);
  const id = randomUUID();
  const [referral] = await db
    .insert(referralsTable)
    .values({
      id,
      ...body,
      status: "pending",
    })
    .returning();
  res.status(201).json(referral);
});

export default router;
