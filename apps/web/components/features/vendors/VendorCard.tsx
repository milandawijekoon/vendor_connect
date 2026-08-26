import Link from 'next/link';
import type { VendorListItemDto } from '@vendorconnect/shared';

interface Props {
  vendor: Pick<VendorListItemDto, 'slug' | 'businessName' | 'city' | 'avgRating' | 'reviewCount' | 'priceMin' | 'priceMax' | 'categories' | 'images'>;
}

function StarRow({ rating, count }: { rating: number; count: number }) {
  const full = Math.round(rating);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span>
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} style={{ color: i < full ? 'var(--star)' : 'var(--border)', fontSize: 13 }}>★</span>
        ))}
      </span>
      <span style={{ fontSize: 12, color: 'var(--text-sec)', fontWeight: 500 }}>
        {rating.toFixed(1)} <span style={{ color: 'var(--text-muted)' }}>({count})</span>
      </span>
    </span>
  );
}

export function VendorCard({ vendor }: Props) {
  const cover = vendor.images[0];
  const primaryCategory = vendor.categories[0];

  return (
    <Link href={`/vendors/${vendor.slug}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
      <article className="vendor-card-article">
        {/* Image */}
        <div style={{ position: 'relative', height: 210, background: 'var(--primary-light)', overflow: 'hidden' }}>
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover.url}
              alt={vendor.businessName}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
              💍
            </div>
          )}

          {/* Category badge overlay */}
          {primaryCategory && (
            <span style={{
              position: 'absolute', top: 12, left: 12,
              padding: '4px 10px',
              background: 'rgba(255,255,255,0.92)',
              borderRadius: 'var(--radius-full)',
              fontSize: 11, fontWeight: 700,
              color: 'var(--primary)',
              backdropFilter: 'blur(4px)',
            }}>
              {primaryCategory.name}
            </span>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: '14px 16px 16px' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px', color: 'var(--text)', lineHeight: 1.3 }}>
            {vendor.businessName}
          </h3>

          <p style={{ margin: '0 0 8px', color: 'var(--text-sec)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 11 }}>📍</span> {vendor.city}
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
            <StarRow rating={vendor.avgRating} count={vendor.reviewCount} />

            {(vendor.priceMin ?? vendor.priceMax) ? (
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', background: 'var(--primary-light)', padding: '3px 8px', borderRadius: 'var(--radius-full)' }}>
                {vendor.priceMin ? `LKR ${vendor.priceMin.toLocaleString()}` : ''}
                {vendor.priceMin && vendor.priceMax ? '+' : ''}
              </span>
            ) : null}
          </div>
        </div>
      </article>
    </Link>
  );
}
