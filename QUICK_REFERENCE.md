# Quick Reference: Landing Page Files

## Files to Copy

### 1. Middleware (Project Root)
**Source**: `middleware.ts`
**Destination**: `C:\Users\Buzwem\Modeky\middleware.ts`
**Purpose**: Check auth → redirect logged-in users to dashboard

### 2. Landing Page (App Root)
**Source**: `src/app/page.tsx`
**Destination**: `C:\Users\Buzwem\Modeky\src\app\page.tsx`
**Purpose**: Main landing page with all sections

---

## Integration Checklist

- [ ] Copy `middleware.ts` to project root
- [ ] Replace `src/app/page.tsx` with new landing page
- [ ] Run `npm run build` to verify no errors
- [ ] Test locally: `npm run dev`
- [ ] Visit `http://localhost:3000` (should see landing page if not logged in)
- [ ] Login and verify redirect to dashboard
- [ ] Commit: `git add . && git commit -m "Add landing page with auth middleware"`
- [ ] Push to GitHub: `git push`
- [ ] Verify Vercel auto-deploys

---

## Key Features

✅ **Split-screen hero** — WhatsApp + Dashboard demos
✅ **3-step workflow** — Simple process visualization
✅ **4 feature cards** — GPS, Selfie, Visibility, Reports
✅ **Dashboard showcase** — KPI cards preview
✅ **3 use cases** — Security, Cleaning, Construction
✅ **Testimonials** — Customer quotes
✅ **Final CTA** — Get Started / Book Demo
✅ **Footer** — Links and contact info
✅ **Responsive** — Mobile, tablet, desktop
✅ **Design system colors** — Matches your Figma spec

---

## What Happens

### For Visitor (Not Logged In)
1. Lands on `/` 
2. Sees landing page
3. Clicks "Get Started" → goes to `/signup`
4. Creates account → redirected to dashboard

### For Manager (Logged In)
1. Visits `/` 
2. Middleware detects auth
3. Automatically redirected to `/dashboard`
4. Sees their workspace

---

## Environment Variables Needed

These should already be in your `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

The middleware uses these to check authentication.

---

## Testing

### Local (Not logged in)
```
http://localhost:3000
→ Should see landing page
```

### Local (Logged in)
```
1. Log in at http://localhost:3000/login
2. Visit http://localhost:3000
→ Should redirect to http://localhost:3000/dashboard
```

### After Vercel Deploy
```
Visit https://your-app.vercel.app
→ If not logged in: landing page
→ If logged in: dashboard
```

---

## CTA Buttons Action

- **Get Started** (hero, final CTA) → `/signup`
- **Sign In** (nav) → `/login`
- **Book a Demo** → Update to your demo booking link

To change "Book a Demo" link:
Find in `src/app/page.tsx`:
```tsx
<button className="inline-flex items-center gap-2 ...">
  Watch Demo
</button>
```

Change to:
```tsx
<Link href="https://calendly.com/your-link">
  Book a Demo
</Link>
```

---

## Customizations You Might Want

1. **Add email form** — Newsletter signup in hero
2. **Add video** — Embed demo video instead of static mockup
3. **Add pricing table** — Show different plans
4. **Add FAQs** — Common questions section
5. **Add live chat** — Support widget (e.g., Intercom)
6. **Add analytics** — Track CTA clicks, conversions

All of these can be added to `src/app/page.tsx` following the existing pattern.

---

## Troubleshooting

**Q: Landing page shows 401 error**
A: Check if Deployment Protection is enabled on Vercel. Disable it or add your team.

**Q: Middleware not redirecting**
A: Ensure `middleware.ts` is at project root, not in src/ folder.

**Q: Lucide icons not showing**
A: Install lucide-react: `npm install lucide-react`

**Q: Design system colors not applying**
A: Make sure you've integrated the design system CSS files (fonts.css, theme.css, globals.css)

---

## Performance Tips

- ✅ Images are CSS-based (no external images = fast)
- ✅ No animations that block rendering
- ✅ Responsive images with srcset
- ✅ Small JS footprint (middleware is Edge Function)

Core Web Vitals should be excellent once deployed.

---

Done! You're ready to launch. 🚀
