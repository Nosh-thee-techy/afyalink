# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains the AfyaLink app — an offline-first telemedicine platform for Kenyan Community Health Promoters (CHPs) and refugee camp health workers in ASAL counties.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS v4
- **UI Libraries**: Framer Motion, React Hook Form, QRCode React

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (routes: patients, consultations, referrals, dashboard)
│   └── afyalink/           # React + Vite web app (AfyaLink MVP)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/
│   └── src/seed-afyalink.ts # Demo data seeder (10 patients, referrals, consultations)
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## AfyaLink App

### What It Is
AfyaLink is a hackathon MVP telemedicine platform targeting Kenya's 100,000+ Community Health Promoters (CHPs) and refugee camp health workers in ASAL counties (Turkana, Garissa, Mandera, Wajir) and Dadaab/Kakuma camps.

### Features
1. **CHP Login** — Enter CHP ID (e.g. CHP-KE-001), language selector (English/Swahili/Somali), offline mode indicator
2. **Patient Queue** — List all patients with triage level badges and sync status, add new patients
3. **AI Triage** — Symptom checklist + simulated on-device AI classification (4 levels: Normal/Urgent/Emergency/Pregnancy Danger) with Swahili/English result display
4. **Referrals** — Generate referrals to Kenya facilities (Kakuma, Dadaab, Turkana, Garissa, etc.), refugee QR code generation, referral status tracking
5. **Supervisor Dashboard** — Stats grid, county breakdown table, eCHIS sync button, CSV export

### Theme
- Kenya green (#006600 approx) primary color
- Large accessible fonts for outdoor sunlight readability
- Mobile-first phone frame UI (480px max)
- 4 vivid triage colors: green/orange/red/purple

### Demo Flow (Hackathon Judges)
1. Open app → Enter `CHP-KE-001` → Press "Enter Offline Mode"
2. Queue shows 10 pre-seeded patients with triage levels
3. Tap Triage → New patient → Enter details → Select symptoms → "Run AI Triage"
4. See color-coded result with Swahili/English text
5. Create referral → Choose facility → See Kenya map of facilities
6. Dashboard → Stats → Press "Sync to eCHIS" → See success toast

### API Routes
- `GET/POST /api/patients` — patient management
- `PATCH /api/patients/:id` — update triage/status
- `GET/POST /api/consultations` — consultations
- `GET/POST /api/referrals` — referrals
- `GET /api/dashboard/stats` — aggregated statistics
- `POST /api/dashboard/sync` — simulate eCHIS sync

### Database Schema
- `patients` — id, name, age, sex, location, chp_id, is_refugee, qr_code, symptoms_description, triage_level, triage_confidence, status
- `consultations` — id, patient_id, chp_id, notes, has_video, has_sms_alert, sync_status
- `referrals` — id, patient_id, chp_id, facility_name, facility_level, distance_km, county, urgency, status

### Seeding
Run `pnpm --filter @workspace/scripts run seed-afyalink` to (re)seed 10 demo patients.

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — only `.d.ts` files during typecheck
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references`

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly`
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API client from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes
- `pnpm --filter @workspace/scripts run seed-afyalink` — seed demo data
