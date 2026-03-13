import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { consultationsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import {
  ListConsultationsQueryParams,
  CreateConsultationBody,
} from "@workspace/api-zod";
import { randomUUID } from "crypto";

const router: IRouter = Router();

router.get("/consultations", async (req, res) => {
  const query = ListConsultationsQueryParams.parse(req.query);
  let consultations;
  if (query.patientId) {
    consultations = await db
      .select()
      .from(consultationsTable)
      .where(eq(consultationsTable.patientId, query.patientId))
      .orderBy(consultationsTable.createdAt);
  } else {
    consultations = await db
      .select()
      .from(consultationsTable)
      .orderBy(consultationsTable.createdAt);
  }
  res.json(consultations);
});

router.post("/consultations", async (req, res) => {
  const body = CreateConsultationBody.parse(req.body);
  const id = randomUUID();
  const [consultation] = await db
    .insert(consultationsTable)
    .values({
      id,
      ...body,
      syncStatus: "pending",
    })
    .returning();
  res.status(201).json(consultation);
});

export default router;
