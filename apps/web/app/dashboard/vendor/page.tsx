'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { PortfolioImageDto, VendorProfileDto } from '@vendorconnect/shared';
import { Role } from '@vendorconnect/shared';
import { ApiClientError } from '../../../lib/api/client';
import { vendorsApi } from '../../../lib/api/vendors';
import { PortfolioUploader } from '../../../components/features/vendors/PortfolioUploader';
import { DashboardShell } from '../../../components/ui/DashboardShell';
import {
  Badge,
  Callout,
  EmptyState,
  LoadingBlock,
  PageHeader,
  StatCard,
  VENDOR_STATUS_TONE,
} from '../../../components/ui/primitives';
import { Icon } from '../../../components/ui/icons';

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

  const statusMeta = profile
    ? VENDOR_STATUS_TONE[profile.status] ?? { tone: 'neutral' as const, label: profile.status }
    : null;

  return (
    <DashboardShell requireRole={Role.VENDOR}>
      {isLoading ? (
        <LoadingBlock />
      ) : noProfile ? (
        <EmptyState
          icon="building"
          title="Set up your business profile"
          body="Create your profile to appear in the marketplace and start receiving inquiries."
          action={
            <Link href="/dashboard/vendor/profile" className="btn btn--primary btn--sm">
              Create profile
            </Link>
          }
        />
      ) : profile && statusMeta ? (
        <>
          <PageHeader
            eyebrow="Vendor"
            title={profile.businessName}
            actions={
              <>
                <Link href={`/vendors/${profile.slug}`} target="_blank" className="btn btn--ghost btn--sm">
                  <Icon name="external-link" size={15} />
                  View public page
                </Link>
                <Link href="/dashboard/vendor/profile" className="btn btn--outline btn--sm">
                  <Icon name="pen-tool" size={15} />
                  Edit profile
                </Link>
              </>
            }
          />

          <div style={{ marginBottom: 20 }}>
            <Badge tone={statusMeta.tone}>{statusMeta.label}</Badge>
          </div>

          {profile.status === 'PENDING' && (
            <Callout tone="warning" icon="alert-triangle">
              Your profile is under review. We&apos;ll email you once it&apos;s approved and live on the marketplace.
            </Callout>
          )}
          {profile.status === 'REJECTED' && (
            <Callout tone="danger" icon="alert-triangle">
              Your profile was not approved. Update your details and it will be re-reviewed automatically.
            </Callout>
          )}
          {profile.status === 'SUSPENDED' && (
            <Callout tone="danger" icon="alert-triangle">
              Your listing is currently suspended and hidden from customers. Contact support if you think this is a
              mistake.
            </Callout>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: 14,
              margin: '20px 0 32px',
            }}
          >
            <StatCard label="Average rating" value={profile.avgRating.toFixed(1)} icon="star-filled" />
            <StatCard label="Reviews" value={profile.reviewCount} icon="message-circle" />
            <StatCard label="Portfolio photos" value={images.length} icon="image" />
          </div>

          <section>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Portfolio photos</h2>
            <p style={{ fontSize: 13, color: 'var(--text-sec)', marginBottom: 14 }}>
              High-quality photos help customers choose you. Up to 20 images.
            </p>
            <PortfolioUploader images={images} onChange={setImages} />
          </section>
        </>
      ) : null}
    </DashboardShell>
  );
}
