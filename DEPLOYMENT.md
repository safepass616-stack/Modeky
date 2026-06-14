# Deployment Guide (Vercel + Supabase)

This guide walks through deploying Modeky to production.

---

## 1. Provision Supabase

1. Create a new project at [supabase.com](https://supabase.com) (choose a
   region close to your customers).
2. Run the migrations in `supabase/migrations/` against the project, either
   with the Supabase CLI:

   ```bash
   supabase login
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```

   or by pasting each file (in order: `0001_...`, `0002_...`, `0003_...`)
   into **SQL Editor** in the Supabase dashboard and running them.

3. Confirm the `selfies` bucket was created: **Storage → Buckets**. It
   should be marked **Public**.

4. Copy these three values from **Project Settings → API**:
   - `Project URL`
   - `anon` `public` key
   - `service_role` `secret` key

---

## 2. Deploy to Vercel

1. Push this repository to GitHub (or GitLab/Bitbucket).
2. In [Vercel](https://vercel.com), click **Add New → Project** and import
   the repository. Vercel auto-detects Next.js — no build configuration
   changes are needed.
3. Add the following **Environment Variables** (Project Settings →
   Environment Variables), for both **Production** and **Preview**:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | from Supabase Project Settings → API |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from Supabase Project Settings → API |
   | `SUPABASE_SERVICE_ROLE_KEY` | from Supabase Project Settings → API |
   | `WHATSAPP_TOKEN` | from Meta App → WhatsApp → API Setup |
   | `WHATSAPP_PHONE_NUMBER_ID` | from Meta App → WhatsApp → API Setup |
   | `WHATSAPP_VERIFY_TOKEN` | a random string you choose |
   | `NEXT_PUBLIC_SITE_URL` | `https://<your-vercel-domain>` |

4. Click **Deploy**. Vercel will build and deploy the app.

---

## 3. Configure Supabase Auth redirect URLs

In Supabase → **Authentication → URL Configuration**, set:

- **Site URL**: `https://<your-vercel-domain>`
- **Redirect URLs**: add `https://<your-vercel-domain>/update-password`
  (used by the "forgot password" email link)

---

## 4. Configure the WhatsApp webhook

In your Meta App → **WhatsApp → Configuration**:

- **Callback URL**: `https://<your-vercel-domain>/api/webhooks/whatsapp`
- **Verify Token**: must exactly match `WHATSAPP_VERIFY_TOKEN` set in Vercel
- Subscribe to the `messages` field

Meta will send a `GET` request to verify the callback URL — the route in
`src/app/api/webhooks/whatsapp/route.ts` handles this automatically as long
as `WHATSAPP_VERIFY_TOKEN` matches.

---

## 5. Create your first company (tenant)

Visit `https://<your-vercel-domain>/signup` and complete the onboarding
form. This creates:

- A row in `companies`
- A `company_admin` auth user, linked via `public.users.company_id`

You can repeat this for each new customer — each signup creates a fully
isolated tenant thanks to the RLS policies in
`0001_initial_schema.sql`.

---

## 6. Smoke test

1. Sign in at `/login`.
2. Add a **Site** (use a latitude/longitude near you, e.g. from Google
   Maps — right-click a location and copy the coordinates).
3. Add an **Employee** with your own WhatsApp number in E.164 format
   (e.g. `+14155552671`).
4. From that WhatsApp number, send `START` to your Business number.
   You should be prompted for your location, then a selfie, then receive
   "Check-in successful."
5. Refresh the **Dashboard** — you should see "Checked In Today" increment
   and the employee appear in the attendance table.
6. Send `END` to check out.
7. Go to **Reports**, select today's date, and export CSV / Excel.

---

## 7. Ongoing maintenance

- **New migrations**: add a new numbered file to `supabase/migrations/`
  and run `supabase db push` again — never edit existing migration files
  once applied to production.
- **Monitoring**: use Vercel's function logs for the webhook and report
  routes, and Supabase's **Logs → Postgres / Auth / Storage** for backend
  issues.
