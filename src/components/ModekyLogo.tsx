import React from 'react';

interface ModekyLogoProps {
  size?: number;
  showText?: boolean;
  variant?: 'full' | 'icon' | 'horizontal';
  className?: string;
}

export function ModekyLogo({ 
  size = 40, 
  showText = true, 
  variant = 'horizontal',
  className = ''
}: ModekyLogoProps) {
  const iconSize = size;
  const textSize = Math.max(size * 0.5, 16);

  if (variant === 'icon') {
    return (
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Chat Bubble */}
        <path
          d="M20 15C20 10.58 23.58 7 29 7H75C80.42 7 84 10.58 84 15V55C84 59.42 80.42 63 75 63H45L30 75C28 76.5 25 75.5 25 73V63C22.24 63 20 60.76 20 58V15Z"
          fill="#2563EB"
          opacity="0.1"
          stroke="#2563EB"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Checkmark Shield */}
        <g transform="translate(50, 35)">
          {/* Shield background */}
          <path
            d="M0 -15C0 -15 -15 -5 -15 5C-15 15 0 25 0 25C0 25 15 15 15 5C15 -5 0 -15 0 -15Z"
            fill="#2563EB"
          />
          
          {/* Checkmark */}
          <path
            d="M-5 5L0 10L8 2"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>
      </svg>
    );
  }

  if (variant === 'full' || !showText) {
    return (
      <div className={className}>
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Chat Bubble */}
          <path
            d="M20 15C20 10.58 23.58 7 29 7H75C80.42 7 84 10.58 84 15V55C84 59.42 80.42 63 75 63H45L30 75C28 76.5 25 75.5 25 73V63C22.24 63 20 60.76 20 58V15Z"
            fill="#2563EB"
            opacity="0.1"
            stroke="#2563EB"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Checkmark Shield */}
          <g transform="translate(50, 35)">
            {/* Shield background */}
            <path
              d="M0 -15C0 -15 -15 -5 -15 5C-15 15 0 25 0 25C0 25 15 15 15 5C15 -5 0 -15 0 -15Z"
              fill="#2563EB"
            />
            
            {/* Checkmark */}
            <path
              d="M-5 5L0 10L8 2"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </g>
        </svg>
      </div>
    );
  }

  // Horizontal layout (default)
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Chat Bubble */}
        <path
          d="M20 15C20 10.58 23.58 7 29 7H75C80.42 7 84 10.58 84 15V55C84 59.42 80.42 63 75 63H45L30 75C28 76.5 25 75.5 25 73V63C22.24 63 20 60.76 20 58V15Z"
          fill="#2563EB"
          opacity="0.1"
          stroke="#2563EB"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Checkmark Shield */}
        <g transform="translate(50, 35)">
          {/* Shield background */}
          <path
            d="M0 -15C0 -15 -15 -5 -15 5C-15 15 0 25 0 25C0 25 15 15 15 5C15 -5 0 -15 0 -15Z"
            fill="#2563EB"
          />
          
          {/* Checkmark */}
          <path
            d="M-5 5L0 10L8 2"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>
      </svg>

      {showText && (
        <span
          style={{ fontSize: `${textSize}px` }}
          className="font-bold text-foreground tracking-tight"
        >
          Modeky
        </span>
      )}
    </div>
  );
}
