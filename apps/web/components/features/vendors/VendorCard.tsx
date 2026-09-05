import Link from 'next/link';
import Image from 'next/image';
import type { VendorListItemDto } from '@vendorconnect/shared';
import { Icon, categoryIcon } from '../../ui/icons';
import { Stars } from '../../ui/primitives';

interface Props {
  vendor: Pick<
    VendorListItemDto,
    'slug' | 'businessName' | 'city' | 'avgRating' | 'reviewCount' | 'priceMin' | 'priceMax' | 'categories' | 'images'
  >;
}

export function VendorCard({ vendor }: Props) {
  const cover = vendor.images[0];
  const primaryCategory = vendor.categories[0];

  return (
    <Link href={`/vendors/${vendor.slug}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
      <article className="vendor-card-article">
        <div style={{ position: 'relative', height: 200, background: 'var(--primary-light)', overflow: 'hidden' }}>
          {cover ? (
            <Image
              src={cover.url}
              alt={vendor.businessName}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
                opacity: 0.5,
              }}
            >
              <Icon name={primaryCategory ? categoryIcon(primaryCategory.slug) : 'image'} size={36} />
            </div>
          )}

          {primaryCategory && (
            <span
              style={{
                position: 'absolute',
                top: 12,
                left: 12,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 10px',
                background: 'rgba(255,255,255,0.94)',
                borderRadius: 'var(--radius-full)',
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--primary)',
              }}
            >
              <Icon name={categoryIcon(primaryCategory.slug)} size={12} />
              {primaryCategory.name}
            </span>
          )}
        </div>

        <div style={{ padding: '14px 16px 16px' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px', color: 'var(--text)', lineHeight: 1.3 }}>
            {vendor.businessName}
          </h3>

          <p
            style={{
              margin: '0 0 10px',
              color: 'var(--text-sec)',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Icon name="map-pin" size={13} />
            {vendor.city}
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
            <Stars rating={vendor.avgRating} size={13} count={vendor.reviewCount} showValue />

            {(vendor.priceMin ?? vendor.priceMax) ? (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--primary)',
                  background: 'var(--primary-light)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)',
                }}
              >
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
