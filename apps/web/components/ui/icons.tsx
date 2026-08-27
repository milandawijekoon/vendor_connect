import type { CSSProperties } from 'react';

/**
 * Single inline-SVG icon set — no runtime dependency.
 * 24×24 viewBox, currentColor stroke, rounded caps. Feather / Lucide style.
 */

export type IconName =
  | 'search'
  | 'map-pin'
  | 'star'
  | 'star-filled'
  | 'check'
  | 'check-circle'
  | 'x'
  | 'arrow-right'
  | 'chevron-down'
  | 'chevron-left'
  | 'chevron-right'
  | 'menu'
  | 'sliders'
  | 'upload'
  | 'trash'
  | 'calendar'
  | 'mail'
  | 'phone'
  | 'building'
  | 'user'
  | 'users'
  | 'shield-check'
  | 'camera'
  | 'video'
  | 'utensils'
  | 'flower'
  | 'sparkles'
  | 'music'
  | 'cake'
  | 'speaker'
  | 'clipboard-list'
  | 'gift'
  | 'ring'
  | 'car'
  | 'gem'
  | 'pen-tool'
  | 'briefcase'
  | 'external-link'
  | 'log-out'
  | 'layout-dashboard'
  | 'inbox'
  | 'image'
  | 'alert-triangle'
  | 'message-circle'
  | 'wallet'
  | 'loader';

const PATHS: Record<IconName, JSX.Element> = {
  'search': (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  'map-pin': (
    <>
      <path d="M20 10c0 5-8 12-8 12s-8-7-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  'star': <path d="m12 3 2.6 5.6 6.1.8-4.5 4.2 1.1 6L12 17l-5.4 2.9 1.1-6L3.2 9.4l6.1-.8L12 3Z" />,
  'star-filled': (
    <path
      d="m12 3 2.6 5.6 6.1.8-4.5 4.2 1.1 6L12 17l-5.4 2.9 1.1-6L3.2 9.4l6.1-.8L12 3Z"
      fill="currentColor"
      stroke="none"
    />
  ),
  'check': <path d="m5 12 5 5L20 7" />,
  'check-circle': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </>
  ),
  'x': <path d="M6 6 18 18M18 6 6 18" />,
  'arrow-right': <path d="M5 12h14M13 6l6 6-6 6" />,
  'chevron-down': <path d="m6 9 6 6 6-6" />,
  'chevron-left': <path d="m15 6-6 6 6 6" />,
  'chevron-right': <path d="m9 6 6 6-6 6" />,
  'menu': <path d="M4 7h16M4 12h16M4 17h16" />,
  'sliders': (
    <>
      <path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h7M15 18h5" />
      <circle cx="16" cy="6" r="2" />
      <circle cx="8" cy="12" r="2" />
      <circle cx="13" cy="18" r="2" />
    </>
  ),
  'upload': <path d="M12 15V4M7 9l5-5 5 5M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />,
  'trash': <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M10 11v6M14 11v6" />,
  'calendar': (
    <>
      <rect x="3.5" y="5" width="17" height="16" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  'mail': (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </>
  ),
  'phone': (
    <path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 4.5 4.5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16 16 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5Z" />
  ),
  'building': (
    <>
      <rect x="5" y="3" width="14" height="18" rx="1.5" />
      <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3" />
    </>
  ),
  'user': (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20a8 8 0 0 1 16 0" />
    </>
  ),
  'users': (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3 19a6 6 0 0 1 12 0M16 5.5a3.5 3.5 0 0 1 0 6.5M21 19a6 6 0 0 0-4-5.6" />
    </>
  ),
  'shield-check': <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3ZM9 12l2 2 4-4.5" />,
  'camera': (
    <>
      <path d="M4 8a2 2 0 0 1 2-2h1.5l1.2-2h6.6l1.2 2H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
      <circle cx="12" cy="12.5" r="3.5" />
    </>
  ),
  'video': (
    <>
      <rect x="3" y="6" width="13" height="12" rx="2" />
      <path d="m16 10 5-3v10l-5-3" />
    </>
  ),
  'utensils': <path d="M6 3v7a2 2 0 0 0 4 0V3M8 12v9M16 3c-1.7 0-3 2-3 5s1.3 4 3 4M16 3v18" />,
  'flower': (
    <>
      <circle cx="12" cy="10" r="2.5" />
      <path d="M12 7.5c0-2 1-3.5 2.5-3.5S17 5.5 15 8M12 7.5c0-2-1-3.5-2.5-3.5S7 5.5 9 8M14.5 11c1.7-1 3.5-1 4.2.3.7 1.3-.3 2.7-2.7 2.7M9.5 11c-1.7-1-3.5-1-4.2.3-.7 1.3.3 2.7 2.7 2.7M12 12.5V21M12 21c-2 0-4-1-4-3M12 21c2 0 4-1 4-3" />
    </>
  ),
  'sparkles': <path d="M12 3v6M12 15v6M4.5 12h6M13.5 12h6M6.5 6.5 9 9M15 15l2.5 2.5M17.5 6.5 15 9M9 15l-2.5 2.5" />,
  'music': (
    <>
      <path d="M9 18V5l11-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="17" cy="16" r="3" />
    </>
  ),
  'cake': (
    <>
      <path d="M4 20h16M5 20v-7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7M4 16c1.2 0 1.2 1.5 2.7 1.5S8.4 16 9.6 16s1.2 1.5 2.7 1.5S15 16 16 16" />
      <path d="M12 8V5M12 5c-.8 0-1.2-1-.4-2 .4.6 1.2.6 1.2 0 0 1 .2 2-.8 2Z" fill="currentColor" stroke="none" />
    </>
  ),
  'speaker': (
    <>
      <rect x="6" y="3" width="12" height="18" rx="2" />
      <circle cx="12" cy="14" r="3.5" />
      <circle cx="12" cy="7" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  'clipboard-list': (
    <>
      <rect x="6" y="5" width="12" height="16" rx="2" />
      <path d="M9 5V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1M9.5 10h5M9.5 14h5" />
    </>
  ),
  'gift': <path d="M4 11h16v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1ZM4 8h16v3H4ZM12 8v13M12 8S10.5 3 8 4.5 10 8 12 8ZM12 8s1.5-5 4-3.5S14 8 12 8Z" />,
  'ring': (
    <>
      <circle cx="12" cy="14" r="6" />
      <path d="m9 6 1.5-3h3L15 6l-3 3-3-3Z" />
    </>
  ),
  'car': (
    <>
      <path d="M4 13 6 7a2 2 0 0 1 2-1.4h8A2 2 0 0 1 18 7l2 6M4 13h16v4a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H7v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z" />
      <path d="M7 16h.01M17 16h.01" />
    </>
  ),
  'gem': <path d="M6 3h12l3 5-9 13L3 8ZM3 8h18M9 3 7 8l5 13 5-13-2-5" />,
  'pen-tool': <path d="m12 2 5 5-7.5 7.5L4 20l-2 2 2-2 5.5-5.5L17 7ZM9.5 14.5 7 12M12 2l3.5 3.5" />,
  'briefcase': (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18" />
    </>
  ),
  'external-link': <path d="M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />,
  'log-out': <path d="M15 5V4a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-1M10 12h11M18 9l3 3-3 3" />,
  'layout-dashboard': (
    <>
      <rect x="3" y="3" width="8" height="9" rx="1" />
      <rect x="13" y="3" width="8" height="5" rx="1" />
      <rect x="13" y="10" width="8" height="11" rx="1" />
      <rect x="3" y="14" width="8" height="7" rx="1" />
    </>
  ),
  'inbox': <path d="M4 13h4l1.5 3h5L16 13h4M4 13 6 5a2 2 0 0 1 2-1.5h8A2 2 0 0 1 18 5l2 8v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />,
  'image': (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="m4 18 5-5 3 3 4-4 4 4" />
    </>
  ),
  'alert-triangle': <path d="M12 4 2.5 20h19L12 4ZM12 10v4M12 17.5h.01" />,
  'message-circle': <path d="M4 12a8 8 0 1 1 3.5 6.6L4 20l1.4-3.5A8 8 0 0 1 4 12Z" />,
  'wallet': (
    <>
      <path d="M4 7a2 2 0 0 1 2-2h11a1 1 0 0 1 1 1v2M4 7v11a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1v-3M4 7h15a1 1 0 0 1 1 1v4" />
      <circle cx="16" cy="12.5" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  'loader': <path d="M12 3v4M12 17v4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M3 12h4M17 12h4M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />,
};

interface IconProps {
  name: IconName;
  size?: number | undefined;
  className?: string | undefined;
  style?: CSSProperties | undefined;
  strokeWidth?: number | undefined;
  title?: string | undefined;
}

export function Icon({ name, size = 18, className, style, strokeWidth = 1.75, title }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title ? <title>{title}</title> : null}
      {PATHS[name]}
    </svg>
  );
}

/** Category slug → icon. Slugs come from apps/api/prisma/seed.ts. */
export const CATEGORY_ICON: Record<string, IconName> = {
  'photography': 'camera',
  'videography': 'video',
  'venues': 'building',
  'catering': 'utensils',
  'decoration': 'sparkles',
  'makeup-hair': 'sparkles',
  'music-entertainment': 'music',
  'flowers-floral': 'flower',
  'cakes-desserts': 'cake',
  'attire-styling': 'pen-tool',
  'sound-lighting': 'speaker',
  'invitations-stationery': 'clipboard-list',
  'transportation': 'car',
  'jewellery': 'gem',
  'event-planning': 'briefcase',
};

export function categoryIcon(slug: string): IconName {
  return CATEGORY_ICON[slug] ?? 'briefcase';
}
