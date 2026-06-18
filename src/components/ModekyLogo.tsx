// src/components/ModekyLogo.tsx
// Custom Modeky compass logo — matches the Figma design exactly

interface ModekyLogoProps {
  size?: number
  variant?: 'default' | 'inverted'   // inverted = white (for dark sidebar)
  className?: string
}

export function ModekyLogo({ size = 32, variant = 'default', className = '' }: ModekyLogoProps) {
  const isInverted = variant === 'inverted'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Modeky"
    >
      {/* North arrow */}
      <path
        d="M20 2 L23.5 17 L20 14 L16.5 17 Z"
        fill={isInverted ? 'white' : '#2563EB'}
      />
      {/* South arrow */}
      <path
        d="M20 38 L23.5 23 L20 26 L16.5 23 Z"
        fill={isInverted ? 'rgba(255,255,255,0.7)' : '#1E40AF'}
      />
      {/* East arrow */}
      <path
        d="M38 20 L23 16.5 L26 20 L23 23.5 Z"
        fill={isInverted ? 'white' : '#2563EB'}
      />
      {/* West arrow */}
      <path
        d="M2 20 L17 16.5 L14 20 L17 23.5 Z"
        fill={isInverted ? 'rgba(255,255,255,0.7)' : '#1E40AF'}
      />
      {/* Center diamond */}
      <path
        d="M20 13 L27 20 L20 27 L13 20 Z"
        fill={isInverted ? 'rgba(255,255,255,0.15)' : '#EFF6FF'}
      />
      {/* Check mark inside diamond */}
      <path
        d="M15.5 20.2 L18.5 23.2 L24.5 17.2"
        stroke={isInverted ? 'white' : '#2563EB'}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}
