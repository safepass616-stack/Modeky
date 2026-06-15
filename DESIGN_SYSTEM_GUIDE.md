# Modeky Design System Integration Guide

This design system implements the Figma design specifications for Modeky, featuring:

- **Typography**: Plus Jakarta Sans (headings) + Inter (body)
- **Colors**: Deep Navy, Blue, Green, Amber, Red with proper contrast
- **Spacing & Radius**: 12px base radius with responsive scaling
- **Premium B2B SaaS aesthetic**: Clean layouts, soft shadows, subtle gradients

## 📁 File Structure

```
src/
├── styles/
│   ├── fonts.css          # Google Font imports (Plus Jakarta Sans, Inter, JetBrains Mono)
│   ├── theme.css          # CSS variables & color tokens (light + dark mode)
│   ├── tailwind.css       # Tailwind directives
│   └── globals.css        # Base layer styles, typography, utilities
├── app/
│   ├── layout.tsx         # Should import globals.css
│   └── ...
└── ...

tailwind.config.ts        # Tailwind configuration with custom theme values
```

## 🚀 Integration Steps

### 1. Copy Style Files
Copy all files from `src/styles/` to your `src/styles/` (or `src/app/` if that's where you keep styles):
- `fonts.css`
- `theme.css`
- `globals.css`
- `tailwind.css`

### 2. Update Your Root Layout
In your `src/app/layout.tsx`, make sure to import globals.css:

```tsx
import './globals.css';
// or if styles are in app folder:
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### 3. Replace tailwind.config.ts
Replace your existing `tailwind.config.ts` with the one provided. It includes:
- Font family configuration (Inter, Plus Jakarta Sans, JetBrains Mono)
- Complete color system matching the design spec
- Shadow and border radius customizations
- Animation keyframes

### 4. Verify imports in globals.css
If your Tailwind is set up differently, adjust the import path in `globals.css`:
- Change `@import 'tailwindcss'` if needed

## 🎨 Using the Design System

### Colors
Use Tailwind classes with the color tokens:

```tsx
<button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Primary Button
</button>

<div className="bg-success text-success-foreground">
  Success State
</div>

<div className="bg-warning text-warning-foreground">
  Warning State
</div>

<div className="bg-destructive text-destructive-foreground">
  Error State
</div>
```

### Typography
Use the extended font families and utility classes:

```tsx
<h1 className="text-4xl font-bold text-display">
  Page Title
</h1>

<h2 className="text-2xl font-semibold text-headline">
  Section Headline
</h2>

<p className="text-base font-normal text-body">
  Body text goes here
</p>

<label className="text-sm font-medium text-label">
  Form Label
</label>
```

Or use the semantic utility classes:

```tsx
<h1 className="text-display">Display Text</h1>
<h2 className="text-headline">Headline Text</h2>
<p className="text-body">Body Text</p>
<label className="text-label">Label Text</label>
<span className="text-caption">Caption</span>
```

### Shadows
Use the custom shadow utilities:

```tsx
<div className="card-shadow">Light shadow (1px 3px)</div>
<div className="card-shadow-md">Medium shadow (4px 6px)</div>
<div className="card-shadow-lg">Large shadow (10px 15px)</div>
```

### Border Radius
Uses `--radius: 0.75rem` (12px) as base:

```tsx
<div className="rounded-sm">4px (sm)</div>
<div className="rounded-md">10px (md)</div>
<div className="rounded-lg">12px (lg)</div>
<div className="rounded-xl">16px (xl)</div>
```

## 🌙 Dark Mode
Dark mode is automatically supported via the `.dark` class in `theme.css`. Simply add the class to your `<html>` element:

```tsx
<html className="dark">
  {/* Dark mode applied */}
</html>
```

Or use Tailwind's built-in dark mode detection:

```tsx
<html className={isDark ? 'dark' : ''}>
  {/* Toggles based on system preference or manual toggle */}
</html>
```

## 📱 Responsive Design
All typography scales responsively on mobile (< 640px):
- H1: 2rem → 1.5rem
- H2: 1.5rem → 1.25rem
- H3: 1.25rem → 1.125rem

## 🎯 Design Tokens Reference

### Colors
- Primary: `#2563EB` (Blue)
- Primary Foreground: `#ffffff`
- Foreground: `#0F172A` (Deep Navy)
- Background: `#F8FAFC`
- Card: `#ffffff`
- Success: `#16A34A`
- Warning: `#F59E0B`
- Destructive: `#DC2626`
- Border: `rgba(15, 23, 42, 0.08)`

### Fonts
- Display (Headings): Plus Jakarta Sans (weights: 400, 500, 600, 700, 800)
- Body (Text): Inter (weights: 400, 500, 600, 700)
- Code: JetBrains Mono (weights: 400, 500)

### Radius
- sm: 8px
- md: 10px
- lg: 12px (default)
- xl: 16px

## ⚠️ Important Notes

1. **Existing Tailwind Config**: If you had custom Tailwind settings, merge them with the provided `tailwind.config.ts` rather than replacing it wholesale.

2. **CSS Cascade**: The order of imports matters. `globals.css` imports fonts, theme, and tailwind. Make sure it's imported early in your layout.

3. **Tailwind Conflicts**: If you have conflicting utility classes, the new design system ones will take precedence since they use CSS variables.

4. **Next.js App Router**: This assumes you're using the `/app` directory structure (Next.js 13+). Adjust import paths if you're using `/pages`.

## 🔧 Troubleshooting

### Fonts not loading
- Check that `fonts.css` is properly imported in `globals.css`
- Verify Google Fonts URL is accessible
- Check browser DevTools → Network tab

### Colors not applying
- Ensure `theme.css` is imported before Tailwind
- Check that CSS variables are referenced correctly: `var(--primary)`
- Verify dark mode class is on `<html>` if using dark theme

### Styles not showing
- Make sure `globals.css` is imported in your root layout
- Check that Tailwind is configured to scan your file paths
- Run `npm run build` to rebuild CSS

## 📚 Next Steps

1. Test the design system on your existing pages
2. Update component styling to use the new design tokens
3. Ensure all custom colors are replaced with design system colors
4. Test both light and dark modes
5. Verify responsive behavior on mobile devices

---

For questions about the design system, refer to the Figma file or reach out to the design team.
