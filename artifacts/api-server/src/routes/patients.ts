import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { patientsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import {
  ListPatientsQueryParams,
  CreatePatientBody,
  GetPatientParams,
  UpdatePatientParams,
  UpdatePatientBody,
} from "@workspace/api-zod";
import { randomUUID } from "crypto";

const router: IRouter = Router();

router.get("/patients", async (req, res) => {
  const query = ListPatientsQueryParams.parse(req.query);
  let patients;
  if (query.chpId) {
    patients = await db
      .select()
      .from(patientsTable)
      .where(eq(patientsTable.chpId, query.chpId))
      .orderBy(patientsTable.createdAt);
  } else {
    patients = await db
      .select()
      .from(patientsTable)
      .orderBy(patientsTable.createdAt);
  }
  res.json(patients);
});

router.post("/patients", async (req, res) => {
  const body = CreatePatientBody.parse(req.body);
  const id = randomUUID();
  const qrCode = body.isRefugee ? `ANON-${id.slice(0, 8).toUpperCase()}` : null;
  const [patient] = await db
    .insert(patientsTable)
    .values({
      id,
      ...body,
      qrCode,
      status: "pending",
    })
    .returning();
  res.status(201).json(patient);
});

router.get("/patients/:id", async (req, res) => {
  const { id } = GetPatientParams.parse(req.params);
  const [patient] = await db
    .select()
    .from(patientsTable)
    .where(eq(patientsTable.id, id));
  if (!patient) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }
  res.json(patient);
});

router.patch("/patients/:id", async (req, res) => {
  const { id } = UpdatePatientParams.parse(req.params);
  const body = UpdatePatientBody.parse(req.body);
  const [updated] = await db
    .update(patientsTable)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(patientsTable.id, id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Patient not found" });
    return;
  }
  res.json(updated);
});

export default router;
