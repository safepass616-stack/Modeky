# Modeky — The WhatsApp Workforce Operating System

Modeky is a multi-tenant SaaS platform for businesses with field-based
employees (security, cleaning, construction, etc). Employees check in and
out of their shifts entirely through WhatsApp — no app install required.
Managers get a real-time web dashboard showing attendance, presence, and
basic reports.

This repository contains the MVP described in the Modeky PRD:

- Multi-tenant Next.js (App Router) + TypeScript + Tailwind dashboard
- Supabase (Postgres + Auth + Storage) backend with Row Level Security
  enforcing tenant data isolation
- A WhatsApp Cloud API webhook implementing the `START` / `END` / `HELP`
  attendance bot conversation

---

## 1. Architecture overview

### Tenancy model

- **Company = Tenant.** Every business record (`employees`, `sites`,
  `attendance`, `whatsapp_sessions`, `audit_logs`) carries a `company_id`.
- **Row Level Security (RLS)** is enabled on every table. Authenticated
  users can only ever see rows where `company_id = current_user_company_id()`.
  This is enforced at the database level — the frontend never needs to (and
  cannot) bypass it.
- **`public.users`** is a 1:1 extension of Supabase's `auth.users`, storing
  `company_id` and `role`. A Postgres trigger (`on_auth_user_created`)
  automatically creates this row from the metadata supplied when the auth
  user is created.
- **Roles**: `super_admin` (Modeky staff, cross-tenant access),
  `company_admin` (implemented in this MVP), plus `supervisor`,
  `payroll_admin`, `hr_admin`, `read_only` reserved for future use — the
  `role` check constraint already allows them so no schema migration is
  needed when those roles are implemented.
- **Tenant onboarding** (`/signup`) creates a `companies` row and the first
  `company_admin` user using the Supabase service-role key (the only place
  in the app that's allowed to insert into `companies` directly).

### WhatsApp attendance flow

```
Employee: START
Bot:      Please share your location.   (location request message)
Employee: [shares location]
Bot:      Please send a selfie.
Employee: [sends photo]
Bot:      Check-in successful.

Employee: END
Bot:      Checkout successful.

Employee: HELP
Bot:      Available commands: START / END / HELP
```

Conversation state is tracked per-employee in `whatsapp_sessions`. When a
selfie is received, the photo is uploaded to the `selfies` Storage bucket,
the nearest configured `site` is matched (Haversine distance vs.
`radius_meters`), and an `attendance` row is created/updated for the day
with status `present` or `late` (late = check-in at/after
`LATE_CHECKIN_HOUR`, configurable in `src/lib/constants.ts`).

### Tech stack

| Layer       | Choice                                   |
|-------------|-------------------------------------------|
| Frontend    | Next.js 14 (App Router), TypeScript, Tailwind |
| Backend     | Supabase (Postgres, Auth, Storage)         |
| Hosting     | Vercel                                     |
| Messaging   | Meta WhatsApp Cloud API                    |

---

## 2. Project structure

```
modeky/
├── supabase/
│   └── migrations/
│       ├── 0001_initial_schema.sql     # tables, RLS policies, RLS helper functions
│       ├── 0002_auth_sync_trigger.sql  # auth.users -> public.users trigger
│       └── 0003_storage_selfies.sql    # selfie storage bucket + policy
├── src/
│   ├── middleware.ts                   # session refresh + route protection
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts               # browser client
│   │   │   ├── server.ts               # server + admin (service role) clients
│   │   │   └── middleware.ts           # session refresh helper
│   │   ├── actions/                    # server actions (auth, employees, sites)
│   │   ├── types.ts                    # shared TS types / Database schema
│   │   ├── whatsapp.ts                 # WhatsApp Cloud API helpers
│   │   ├── geo.ts                      # Haversine distance / nearest-site
│   │   └── constants.ts
│   ├── components/                     # shared UI components
│   └── app/
│       ├── page.tsx                    # redirects to /login or /dashboard
│       ├── login, signup, reset-password, update-password
│       ├── (dashboard)/
│       │   ├── layout.tsx              # sidebar + topbar shell
│       │   ├── dashboard/page.tsx      # overview cards + attendance table
│       │   ├── employees/              # employee management (list/new/edit)
│       │   ├── sites/                  # site management (list/new/edit)
│       │   └── reports/page.tsx        # daily report + CSV/Excel export
│       └── api/
│           ├── webhooks/whatsapp/route.ts   # WhatsApp Cloud API webhook
│           └── reports/attendance/route.ts  # CSV/XLSX export
├── .env.example
└── package.json
```

---

## 3. Setup

### 3.1 Create a Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. In **Project Settings → API**, copy the `Project URL`, `anon` key, and
   `service_role` key.

### 3.2 Run the database migrations

Using the [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

This runs all files in `supabase/migrations/` in order, creating the
schema, RLS policies, the auth trigger, and the `selfies` storage bucket.

> Alternatively, paste the contents of each file in `supabase/migrations/`
> (in numeric order) into the Supabase SQL Editor and run them.

### 3.3 Configure environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API (keep secret!) |
| `WHATSAPP_TOKEN` | Meta App → WhatsApp → API Setup (permanent token) |
| `WHATSAPP_PHONE_NUMBER_ID` | Meta App → WhatsApp → API Setup |
| `WHATSAPP_VERIFY_TOKEN` | Any random string you choose |
| `NEXT_PUBLIC_SITE_URL` | Your deployed URL (or `http://localhost:3000`) |

### 3.4 Install and run

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`, click **Create company account**, and
complete the onboarding form. This creates your company (tenant) and first
`company_admin` user.

---

## 4. WhatsApp Cloud API setup

1. Create a Meta App at [developers.facebook.com](https://developers.facebook.com)
   and add the **WhatsApp** product.
2. Under **WhatsApp → API Setup**, note your **Phone Number ID** and
   generate a **permanent access token** (System User token with
   `whatsapp_business_messaging` permission).
3. Under **WhatsApp → Configuration**, set the webhook:
   - **Callback URL**: `https://<your-domain>/api/webhooks/whatsapp`
   - **Verify Token**: the same value as `WHATSAPP_VERIFY_TOKEN`
4. Subscribe to the `messages` webhook field.
5. Add employees in the dashboard with their WhatsApp number in **E.164
   format** (e.g. `+254712345678`). They can now message your WhatsApp
   number with `START`, `END`, or `HELP`.

> Note: numbers must be in [Meta's allowed test recipients list](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)
> until your WhatsApp Business Account is fully verified.

---

## 5. Deployment (Vercel)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for a step-by-step guide.

---

## 6. Multi-tenancy & security notes

- **Never** query Supabase from the browser using the service role key —
  only `src/lib/actions/auth.ts` (tenant onboarding) and
  `src/app/api/webhooks/whatsapp/route.ts` use
  `createAdminSupabaseClient()`, and both run exclusively on the server.
- All dashboard pages use `createServerSupabaseClient()`, which is bound to
  the signed-in user's session — RLS does the rest.
- Employee phone numbers are globally unique across the platform (WhatsApp
  numbers are inherently unique), which is how the webhook resolves an
  inbound message to the correct tenant without authentication.
- `companies.subscription_plan` / `subscription_status` are present and
  default to `starter` / `active` so a future billing module can be added
  without a schema change.
- `audit_logs` table exists and is RLS-scoped, ready for a future audit
  logging feature — no application code writes to it yet.

---

## 7. What's intentionally out of scope (per PRD)

Payroll, leave management, scheduling/shift planning, HR management,
invoicing, and subscription billing are **not** implemented in this MVP,
but the `company_id`-based tenancy model is designed so these modules can
be added later without restructuring existing tables.
