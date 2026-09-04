import type { CSSProperties } from 'react';

/**
 * VendorsLK brand mark — two linked nodes forming a "connection".
 * Pure inline SVG, themable via the `color` prop (defaults to brand green).
 */
export function LogoMark({ size = 30, style }: { size?: number | undefined; style?: CSSProperties | undefined }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      style={style}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="9" fill="var(--primary)" />
      <circle cx="11.5" cy="16" r="3.4" fill="#fff" />
      <circle cx="21" cy="10.5" r="2.6" fill="var(--accent)" />
      <circle cx="21" cy="21.5" r="2.6" fill="var(--accent)" />
      <path
        d="M13.9 14.4 18.8 11M13.9 17.6l4.9 3.4"
        stroke="#fff"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface LogoProps {
  size?: number | undefined;
  /** Colour of the "LK" half of the wordmark. Use "#fff" on dark backgrounds. */
  wordmarkColor?: string | undefined;
  /** Colour of the "Vendors" half. Defaults to brand green. */
  brandColor?: string | undefined;
  showWordmark?: boolean | undefined;
  style?: CSSProperties | undefined;
}

export function Logo({
  size = 30,
  wordmarkColor = 'var(--text)',
  brandColor = 'var(--primary)',
  showWordmark = true,
  style,
}: LogoProps) {
  return (
    <span
      style={{ display: 'inline-flex', alignItems: 'center', gap: 9, ...style }}
    >
      <LogoMark size={size} />
      {showWordmark && (
        <span
          style={{
            fontWeight: 800,
            fontSize: size * 0.6,
            letterSpacing: '-0.3px',
            color: brandColor,
            lineHeight: 1,
          }}
        >
          Vendors<span style={{ color: wordmarkColor }}>LK</span>
        </span>
      )}
    </span>
  );
}
