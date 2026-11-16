interface EdgeMaxLogoProps {
  variant?: 'light' | 'dark';
  className?: string;
}

export function EdgeMaxLogo({
  variant = 'light',
  className = '',
}: EdgeMaxLogoProps) {
  const edgeTextColor = variant === 'dark' ? 'text-white' : 'text-slate-950';
  const maxTextColor = variant === 'dark' ? 'text-sky-400' : 'text-sky-600';

  return (
    <span className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <svg
        width="34"
        height="30"
        viewBox="0 0 44 38"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="exBlue" x1="2" y1="6" x2="22" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="exArrow" x1="12" y1="34" x2="40" y2="3" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#EA580C" />
            <stop offset="55%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
        </defs>
        {/* Stylized E */}
        <path
          d="M4 7H20L17.5 12.5H10V16.5H16.5L14.5 21.5H10V26H18L15.5 31.5H4V7Z"
          fill="url(#exBlue)"
        />
        {/* Stylized X + upward arrow */}
        <path
          d="M21.5 11L27 19.5L21 31.5H27.2L30.5 24.3L34 31.5H40.2L33.8 19.2L41.5 4.5L32.5 7.5L35 9.8L30.5 15.2L26.8 9.2L21.5 11Z"
          fill="url(#exBlue)"
        />
        <path
          d="M15.5 34.5L38.5 7.5M38.5 7.5L30.5 8.5M38.5 7.5L37.5 15.5"
          stroke="url(#exArrow)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-display text-xl font-extrabold tracking-tight leading-none whitespace-nowrap">
        <span className={edgeTextColor}>EDGE</span>
        <span className={maxTextColor}>MAX</span>
      </span>
    </span>
  );
}
