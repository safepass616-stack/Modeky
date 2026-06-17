import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ── Modeky Design Tokens ──────────────────────────────────────────
      colors: {
        // Core brand (named tokens for places that want the exact brand hex
        // directly; does not override Tailwind's default blue-50..blue-900 scale)
        navy:    '#0F172A',
        brand:   '#2563EB',
        // shadcn/ui-style semantic tokens — read from CSS vars in globals.css
        // so bg-primary, text-foreground, border-border etc. work (used by
        // the landing page).
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        // Semantic
        success: '#16A34A',
        warning: '#F59E0B',
        danger:  '#DC2626',
        // Backgrounds
        surface: '#F8FAFC',
        // Slate scale (matches Figma)
        slate: {
          50:  '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
      },

      fontFamily: {
        // Headings — Plus Jakarta Sans
        heading: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        // Body — Inter
        body:    ['Inter', 'system-ui', 'sans-serif'],
        // Mono — for times, phone numbers, codes
        mono:    ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },

      borderRadius: {
        // Figma uses 0.75rem = 12px as base, 1rem = 16px for cards
        DEFAULT: '0.75rem',
        sm:  '0.5rem',
        md:  '0.75rem',
        lg:  '1rem',
        xl:  '1.25rem',
        '2xl': '1.5rem',
        full: '9999px',
      },

      boxShadow: {
        // Soft card shadows matching Figma
        card:   '0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)',
        'card-hover': '0 4px 12px rgba(15,23,42,0.08), 0 2px 4px rgba(15,23,42,0.04)',
        sm:     '0 1px 2px rgba(15,23,42,0.05)',
        DEFAULT:'0 1px 3px rgba(15,23,42,0.1), 0 1px 2px rgba(15,23,42,0.06)',
        md:     '0 4px 6px rgba(15,23,42,0.07), 0 2px 4px rgba(15,23,42,0.05)',
        lg:     '0 10px 15px rgba(15,23,42,0.08), 0 4px 6px rgba(15,23,42,0.04)',
      },

      // Extend spacing for consistent layout
      spacing: {
        '4.5': '1.125rem',
        '5.5': '1.375rem',
        '13':  '3.25rem',
        '15':  '3.75rem',
        '18':  '4.5rem',
      },

      // Sidebar width
      width: {
        sidebar: '15rem', // 240px
      },

      // Animation for the live pulse indicator
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}

export default config
