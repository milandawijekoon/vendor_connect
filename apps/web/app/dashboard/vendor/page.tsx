'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { VendorProfileDto } from '@vendorconnect/shared';
import { ApiClientError } from '../../../lib/api/client';
import { vendorsApi } from '../../../lib/api/vendors';
import { PortfolioUploader } from '../../../components/features/vendors/PortfolioUploader';
import type { PortfolioImageDto } from '@vendorconnect/shared';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pending approval', color: '#d97706' },
  APPROVED: { label: 'Live', color: '#16a34a' },
  REJECTED: { label: 'Rejected', color: '#dc2626' },
  SUSPENDED: { label: 'Suspended', color: '#6b7280' },
};

export default function VendorDashboardPage() {
  const [profile, setProfile] = useState<VendorProfileDto | null>(null);
  const [images, setImages] = useState<PortfolioImageDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [noProfile, setNoProfile] = useState(false);

  useEffect(() => {
    vendorsApi
      .getOwn()
      .then((p) => {
        setProfile(p);
        setImages(p.images);
      })
      .catch((err) => {
        if (err instanceof ApiClientError && err.statusCode === 404) setNoProfile(true);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <main style={{ padding: 32 }}>Loading…</main>;

  if (noProfile) {
    return (
      <main style={{ maxWidth: 600, margin: '60px auto', padding: '0 16px', textAlign: 'center' }}>
        <h1>Welcome to your vendor dashboard</h1>
        <p style={{ color: '#6b7280', marginBottom: 24 }}>
          You haven&apos;t set up your vendor profile yet. Create it now to start receiving inquiries.
        </p>
        <Link
          href="/dashboard/vendor/profile"
          style={{ padding: '10px 28px', background: '#1d4ed8', color: '#fff', borderRadius: 6, textDecoration: 'none' }}
        >
          Create profile
        </Link>
      </main>
    );
  }

  if (!profile) return null;

  const statusInfo = STATUS_LABELS[profile.status] ?? { label: profile.status, color: '#6b7280' };

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: '0 0 4px' }}>{profile.businessName}</h1>
          <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 12, background: statusInfo.color, color: '#fff', fontSize: 13 }}>
            {statusInfo.label}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link
            href="/dashboard/vendor/inquiries"
            style={{ padding: '8px 20px', border: '1px solid #d1d5db', borderRadius: 6, textDecoration: 'none', color: '#374151', fontSize: 14 }}
          >
            Inquiries
          </Link>
          <Link
            href="/dashboard/vendor/profile"
            style={{ padding: '8px 20px', border: '1px solid #d1d5db', borderRadius: 6, textDecoration: 'none', color: '#374151', fontSize: 14 }}
          >
            Edit profile
          </Link>
        </div>
      </div>

      {profile.status === 'PENDING' && (
        <div style={{ padding: 16, background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 6, marginBottom: 24 }}>
          Your profile is under review. We&apos;ll notify you once it&apos;s approved and live on the marketplace.
        </div>
      )}

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
        {[
          { label: 'Rating', value: `⭐ ${profile.avgRating.toFixed(1)}` },
          { label: 'Reviews', value: profile.reviewCount },
          { label: 'Photos', value: images.length },
        ].map((stat) => (
          <div key={stat.label} style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{stat.value}</div>
            <div style={{ color: '#6b7280', fontSize: 13 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Portfolio */}
      <section>
        <h2 style={{ fontSize: 18, marginBottom: 12 }}>Portfolio photos</h2>
        <PortfolioUploader images={images} onChange={setImages} />
      </section>
    </main>
  );
}
