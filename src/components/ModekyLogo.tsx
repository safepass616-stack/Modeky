// src/components/ModekyLogo.tsx
// Modeky logo — chat-bubble checkmark icon + wordmark, fixed unit.
// Icon is built as scalable SVG (crisp at any size); wordmark is a styled
// <span> rather than SVG <text> for reliable cross-browser font rendering.

interface ModekyLogoProps {
  size?: number
  variant?: 'default' | 'inverted'   // inverted = white wordmark, for dark backgrounds
  className?: string
  showWordmark?: boolean             // set false to render icon only
}

export function ModekyLogo({
  size = 32,
  variant = 'default',
  className = '',
  showWordmark = true,
}: ModekyLogoProps) {
  const isInverted = variant === 'inverted'

  const ringColor  = '#4A7BC8'
  const tickColor  = '#3964B5'
  const wordColor  = isInverted ? '#FFFFFF' : '#0F172A'

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="flex-shrink-0"
      >
        {/* Ring — open gap at top-right where the checkmark breaks through */}
        <path
          d="M 22.5 6.2 A 13.5 13.5 0 1 0 31.3 14.8"
          fill="none"
          stroke={ringColor}
          strokeWidth="3.1"
          strokeLinecap="butt"
        />
        {/* Speech-bubble tail, bottom of ring */}
        <path
          d="M 18.5 31.8 L 24.5 32.3 L 21.5 38.5 Z"
          fill={ringColor}
        />
        {/* Checkmark — extends past the ring's gap */}
        <path
          d="M 9.5 18.5 L 16.5 25.5 L 32.5 7.5"
          fill="none"
          stroke={tickColor}
          strokeWidth="4"
          strokeLinecap="butt"
          strokeLinejoin="miter"
        />
      </svg>

      {showWordmark && (
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            color: wordColor,
            fontWeight: 800,
            fontSize: size * 0.72,
            lineHeight: 1,
            letterSpacing: '-0.01em',
          }}
        >
          Modeky
        </span>
      )}
    </span>
  )
}
