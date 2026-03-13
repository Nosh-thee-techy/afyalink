import { db } from "@workspace/db";
import { patientsTable, consultationsTable, referralsTable } from "@workspace/db/schema";
import { randomUUID } from "crypto";

const CHP_ID = "CHP-KE-001";

const seedPatients = [
  {
    name: "Amina Hassan",
    age: 28,
    sex: "female",
    location: "Dadaab",
    isRefugee: true,
    symptomsDescription: "Oedema on legs, reduced fetal movement, high blood pressure",
    triageLevel: "pregnancy_danger",
    triageConfidence: 0.94,
    status: "queued_for_sync",
  },
  {
    name: "Aden Warsame",
    age: 4,
    sex: "male",
    location: "Turkana",
    isRefugee: false,
    symptomsDescription: "High fever (39.8°C), severe rash on torso, difficulty breathing",
    triageLevel: "emergency",
    triageConfidence: 0.91,
    status: "referred",
  },
  {
    name: "Fatuma Ali",
    age: 35,
    sex: "female",
    location: "Garissa",
    isRefugee: true,
    symptomsDescription: "Persistent cough, weight loss, night sweats",
    triageLevel: "urgent",
    triageConfidence: 0.87,
    status: "queued_for_sync",
  },
  {
    name: "Mohamed Abdi",
    age: 7,
    sex: "male",
    location: "Kakuma",
    isRefugee: true,
    symptomsDescription: "Severe malnutrition (MUAC: 110mm), diarrhea, dehydration",
    triageLevel: "emergency",
    triageConfidence: 0.96,
    status: "pending",
  },
  {
    name: "Halima Osman",
    age: 22,
    sex: "female",
    location: "Mandera",
    isRefugee: false,
    symptomsDescription: "Mild fever, headache, body aches",
    triageLevel: "normal",
    triageConfidence: 0.82,
    status: "synced",
  },
  {
    name: "Kipchoge Lokolei",
    age: 45,
    sex: "male",
    location: "Turkana",
    isRefugee: false,
    symptomsDescription: "Chest pain, shortness of breath, sweating",
    triageLevel: "emergency",
    triageConfidence: 0.89,
    status: "referred",
  },
  {
    name: "Zainab Farah",
    age: 30,
    sex: "female",
    location: "Dadaab",
    isRefugee: true,
    symptomsDescription: "Severe abdominal pain during pregnancy, vaginal bleeding",
    triageLevel: "pregnancy_danger",
    triageConfidence: 0.97,
    status: "referred",
  },
  {
    name: "Hassan Guleid",
    age: 12,
    sex: "male",
    location: "Wajir",
    isRefugee: false,
    symptomsDescription: "Swollen lymph nodes, skin rash, prolonged fever",
    triageLevel: "urgent",
    triageConfidence: 0.78,
    status: "queued_for_sync",
  },
  {
    name: "Nasteho Ibrahim",
    age: 2,
    sex: "female",
    location: "Garissa",
    isRefugee: true,
    symptomsDescription: "Rapid breathing, bluish lips, not feeding",
    triageLevel: "emergency",
    triageConfidence: 0.93,
    status: "pending",
  },
  {
    name: "Lokorio Ewoi",
    age: 55,
    sex: "male",
    location: "Turkana",
    isRefugee: false,
    symptomsDescription: "Mild cough, no fever, feeling generally unwell",
    triageLevel: "normal",
    triageConfidence: 0.85,
    status: "synced",
  },
];

const facilities = [
  { name: "Kakuma Mission Hospital", level: "Level 4 Hospital", county: "Turkana", distanceKm: 18 },
  { name: "Dadaab District Hospital", level: "Level 4 Hospital", county: "Garissa", distanceKm: 12 },
  { name: "Turkana County Referral Hospital", level: "Level 5 Hospital", county: "Turkana", distanceKm: 65 },
  { name: "Garissa County Referral Hospital", level: "Level 5 Hospital", county: "Garissa", distanceKm: 48 },
  { name: "Mandera County Hospital", level: "Level 4 Hospital", county: "Mandera", distanceKm: 34 },
  { name: "Wajir County Hospital", level: "Level 4 Hospital", county: "Wajir", distanceKm: 29 },
];

async function main() {
  console.log("Clearing existing seed data...");
  await db.delete(referralsTable);
  await db.delete(consultationsTable);
  await db.delete(patientsTable);

  console.log("Seeding patients...");
  const insertedPatients: Array<typeof patientsTable.$inferSelect> = [];

  for (const p of seedPatients) {
    const id = randomUUID();
    const qrCode = p.isRefugee ? `ANON-${id.slice(0, 8).toUpperCase()}` : null;
    const [patient] = await db
      .insert(patientsTable)
      .values({
        id,
        chpId: CHP_ID,
        qrCode,
        ...p,
      } as any)
      .returning();
    insertedPatients.push(patient);
    console.log(`  ✓ ${patient.name} (${patient.triageLevel})`);
  }

  console.log("\nSeeding consultations...");
  for (let i = 0; i < 6; i++) {
    const patient = insertedPatients[i];
    const id = randomUUID();
    await db.insert(consultationsTable).values({
      id,
      patientId: patient.id,
      chpId: CHP_ID,
      notes: `Clinical notes for ${patient.name}: ${patient.symptomsDescription}`,
      hasVideo: i % 2 === 0,
      hasSmsAlert: i % 3 === 0,
      syncStatus: patient.status === "synced" ? "sent" : "pending",
    });
    console.log(`  ✓ Consultation for ${patient.name}`);
  }

  console.log("\nSeeding referrals...");
  const urgentPatients = insertedPatients.filter(
    (p) => p.status === "referred" || p.triageLevel === "emergency" || p.triageLevel === "pregnancy_danger"
  ).slice(0, 5);

  for (let i = 0; i < urgentPatients.length; i++) {
    const patient = urgentPatients[i];
    const facility = facilities[i % facilities.length];
    const id = randomUUID();
    const urgency =
      patient.triageLevel === "emergency" || patient.triageLevel === "pregnancy_danger"
        ? "emergency"
        : "urgent";
    const statuses: Array<"pending" | "in_transit" | "arrived" | "completed"> = [
      "pending", "in_transit", "arrived", "completed", "pending"
    ];
    await db.insert(referralsTable).values({
      id,
      patientId: patient.id,
      chpId: CHP_ID,
      facilityName: facility.name,
      facilityLevel: facility.level,
      distanceKm: facility.distanceKm,
      county: facility.county,
      urgency,
      status: statuses[i],
    });
    console.log(`  ✓ Referral for ${patient.name} → ${facility.name}`);
  }

  console.log("\n✅ AfyaLink seed data inserted successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
