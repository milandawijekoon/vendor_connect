'use client';

import type { GoldPriceSnapshotDto } from '@vendorconnect/shared';
import { useGoldPrice } from '../../lib/hooks/useGoldPrice';
import { Icon } from './icons';

const rs = (n: number) => `Rs ${Math.round(n).toLocaleString('en-US')}`;
const usd = (n: number) => `$${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

const DISCLAIMER =
  'Indicative only — derived from the LBMA world benchmark and the daily USD/LKR rate. ' +
  'Not an actual Sri Lankan retail price: excludes local import duty, jeweller premium and making charges.';

function tooltip(p: GoldPriceSnapshotDto): string {
  return [
    `Gold — ${p.auctionDate} (${p.source} ${p.auction.toUpperCase()})`,
    ``,
    `Indicative Sri Lanka value`,
    `  Sovereign (22K, 8g)  ${rs(p.lkrPerSovereign22k)}`,
    `  Per gram — 24K ${rs(p.lkrPerGram24k)} · 22K ${rs(p.lkrPerGram22k)} · 18K ${rs(p.lkrPerGram18k)}`,
    ``,
    `World  ${usd(p.usdPerOz)} / oz    USD/LKR ${p.usdToLkr.toFixed(2)}`,
    ``,
    DISCLAIMER,
  ].join('\n');
}

/**
 * Compact daily gold price for the navbar. Shows an INDICATIVE Sri Lanka value
 * for the 22K pawning sovereign (8 g), derived from the LBMA world benchmark and
 * the daily USD/LKR rate — not an actual local retail/jeweller price. Full
 * breakdown and disclaimer on hover. Renders nothing until data is available.
 */
export function GoldPriceBadge({ variant = 'compact' }: { variant?: 'compact' | 'row' }) {
  const price = useGoldPrice();
  const row = variant === 'row';

  if (!price) {
    return (
      <span
        aria-hidden="true"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          whiteSpace: 'nowrap',
          padding: row ? '8px 10px' : '5px 9px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          background: 'var(--white)',
          fontSize: 12.5,
          lineHeight: 1,
          color: 'transparent',
          ...(row ? { width: '100%', justifyContent: 'flex-start', fontSize: 13 } : null),
        }}
      >
        <Icon name="gem" size={14} style={{ color: 'transparent', flexShrink: 0 }} />
        <span>Gold 22K</span>
        <strong style={{ fontWeight: 600 }}>≈ Rs 000,000</strong>
      </span>
    );
  }

  return (
    <span
      title={tooltip(price)}
      aria-label={`Indicative gold price, 22K 8g sovereign, ${rs(price.lkrPerSovereign22k)}. ${DISCLAIMER}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        whiteSpace: 'nowrap',
        padding: row ? '8px 10px' : '5px 9px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        background: 'var(--white)',
        fontSize: 12.5,
        lineHeight: 1,
        color: 'var(--text)',
        cursor: 'help',
        ...(row ? { width: '100%', justifyContent: 'flex-start', fontSize: 13 } : null),
      }}
    >
      <Icon name="gem" size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
      <span style={{ color: 'var(--text-muted)' }}>Gold 22K</span>
      <strong style={{ fontWeight: 600 }}>≈ {rs(price.lkrPerSovereign22k)}</strong>
      <span
        style={{ color: 'var(--text-muted)', fontSize: row ? 11 : 10.5, fontStyle: 'italic' }}
      >
        approx.
      </span>
    </span>
  );
}
