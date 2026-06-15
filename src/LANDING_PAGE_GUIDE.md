# Modeky Landing Page Integration Guide

This package includes:
- **Middleware** (`middleware.ts`) — Handles authentication redirects
- **Landing Page** (`src/app/page.tsx`) — Professional landing with all 7 sections
- **Design System Integration** — Uses your new design tokens and colors

## 📋 What's Included

### Sections
1. **Navigation Bar** — Logo, Get Started (signup), Sign In (login) buttons
2. **Hero Section** — Split-screen demo (WhatsApp ↔ Dashboard)
3. **3-Step Workflow** — Simple process flow visualization
4. **4 Feature Cards** — GPS, Selfie, Site Visibility, Reports
5. **Dashboard Showcase** — KPI cards and recent activity
6. **3 Use Cases** — Security, Cleaning, Construction
7. **Testimonials** — Customer quotes from each industry
8. **Final CTA** — Get Started / Book Demo buttons
9. **Footer** — Links and contact info

## 🚀 Integration Steps

### 1. Copy Middleware
Copy `middleware.ts` to the root of your Modeky project:
```
middleware.ts → C:\Users\Buzwem\Modeky\middleware.ts
```

### 2. Replace Landing Page
Replace your current `src/app/page.tsx` with the new landing page:
```
src/app/page.tsx → C:\Users\Buzwem\Modeky\src/app/page.tsx
```

### 3. Verify Dependencies
The landing page uses these libraries (already in your project):
- `next/link` — Routing
- `lucide-react` — Icons (MapPin, Camera, Eye, FileText, CheckCircle, AlertCircle, MessageSquare, ArrowRight)

If `lucide-react` is not installed:
```powershell
npm install lucide-react
```

### 4. Test Locally
```powershell
cd C:\Users\Buzwem\Modeky
npm run dev
```

Visit `http://localhost:3000`:
- Not logged in → See landing page
- Logged in → Redirects to `/dashboard`

### 5. Deploy to Vercel
Push to GitHub, and Vercel will auto-deploy. The middleware runs on Vercel Edge.

---

## 🔄 How It Works

### Authentication Flow
1. **Visitor lands on `http://app.modeky.com`**
   → Middleware checks if logged in
   → Not logged in → Shows landing page
   → Logged in → Redirects to `/dashboard`

2. **Visitor clicks "Get Started"**
   → Goes to `/signup`
   → Creates account
   → Logs in
   → Redirected to `/dashboard`

3. **Visitor clicks "Sign In"**
   → Goes to `/login`
   → Logs in
   → Redirected to `/dashboard`

4. **Existing user returns to `http://app.modeky.com`**
   → Middleware detects auth
   → Automatically goes to `/dashboard`

### Middleware Routes Handled
- `/` — Landing page (or redirect to dashboard if logged in)
- `/login` — Login page (redirect to dashboard if already logged in)
- `/signup` — Signup page (redirect to dashboard if already logged in)
- `/dashboard/*` — Protected dashboard (redirect to landing if NOT logged in)
- `/reset-password` — Password reset (redirect to dashboard if already logged in)

---

## 🎨 Design System Integration

The landing page uses:
- **Colors**: Primary blue, success green, warning amber, destructive red
- **Typography**: Plus Jakarta Sans (headings), Inter (body)
- **Spacing**: Design system border radius (12px base)
- **Shadows**: Soft shadows for cards
- **Responsive**: Mobile-first design

All colors use CSS variables from `theme.css`, so they automatically adapt to light/dark mode.

---

## 📱 Responsive Behavior

- **Desktop** — Split-screen hero (WhatsApp + Dashboard side-by-side)
- **Tablet** — Stacked demo sections
- **Mobile** — Full-width sections, single column layout

---

## 🔧 Customization

### Change Colors
Edit `src/styles/theme.css` (colors are CSS variables):
```css
--primary: #2563EB;      /* Change primary blue */
--success: #16A34A;       /* Change success green */
--warning: #F59E0B;       /* Change warning amber */
--destructive: #DC2626;   /* Change error red */
```

### Change Hero Copy
Edit the hero section in `src/app/page.tsx`:
```tsx
<h1 className="text-4xl sm:text-5xl lg:text-6xl ...">
  Your headline here
</h1>
```

### Update Use Cases
Edit the use cases in `src/app/page.tsx`:
```tsx
{[
  { title: 'Your Industry', desc: 'Your description' },
  // ...
]}
```

### Update Testimonials
Edit the testimonials in `src/app/page.tsx`:
```tsx
{[
  { quote: 'Your quote', author: 'Name', role: 'Role' },
  // ...
]}
```

---

## ⚠️ Important Notes

1. **Middleware requires Supabase environment variables:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   
   These should already be set in your `.env.local`.

2. **The middleware runs on every request** — it's fast (Edge Function on Vercel), but make sure Supabase connectivity is reliable.

3. **CTA buttons link to:**
   - "Get Started" → `/signup`
   - "Sign In" → `/login`
   - "Book a Demo" → Currently a button (no action) — update to integrate with your demo booking system

4. **Hero demo is static** — It's a visual representation. If you want live demos, you'd need:
   - Embed an actual WhatsApp flow (via iFrame or API)
   - Embed a live dashboard screenshot or iframe

5. **Icons use Lucide React** — All icons (MapPin, Camera, Eye, etc.) come from the `lucide-react` package.

---

## 📊 Analytics & Tracking

Consider adding:
- **Hotjar** — See how visitors interact with the landing page
- **Google Analytics** — Track CTA clicks, conversion funnel
- **PostHog** — Session replay and heatmaps

You can add these to `src/app/layout.tsx` as `<script>` tags.

---

## 🚀 Next Steps

1. ✅ Copy middleware.ts to project root
2. ✅ Replace src/app/page.tsx with landing page
3. ✅ Test locally (`npm run dev`)
4. ✅ Push to GitHub
5. ✅ Verify Vercel auto-deploys
6. ✅ Test live at your deployed URL

---

## 🔗 Related Files

- `src/app/layout.tsx` — Root layout (imports globals.css)
- `src/styles/globals.css` — Design system (colors, fonts)
- `src/app/(dashboard)/dashboard/page.tsx` — Dashboard (protected route)
- `src/app/signup/page.tsx` — Signup flow
- `src/app/login/page.tsx` — Login flow

---

## 💬 Questions?

- **"How do I change the landing page hero?"** → Edit the JSX in `src/app/page.tsx`
- **"How do I add a newsletter signup?"** → Add an email form in the CTA section
- **"How do I track sign-ups?"** → Add analytics tracking to the Get Started button
- **"Can I make the demo interactive?"** → Yes, embed actual flows via iframe or custom components

---

For support, reach out to your engineering team or check the main Modeky documentation.
