'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { AdminStatsDto } from '@vendorconnect/shared';
import { Role } from '@vendorconnect/shared';
import { adminApi } from '../../../lib/api/admin';
import { ApiClientError } from '../../../lib/api/client';
import { DashboardShell } from '../../../components/ui/DashboardShell';
import { Callout, LoadingBlock, PageHeader, StatCard } from '../../../components/ui/primitives';
import { Icon } from '../../../components/ui/icons';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStatsDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .getStats()
      .then(setStats)
      .catch((err) => setError(err instanceof ApiClientError ? err.message : 'Failed to load statistics'));
  }, []);

  return (
    <DashboardShell requireRole={Role.ADMIN}>
      <PageHeader
        eyebrow="Admin"
        title="Platform overview"
        description="Marketplace health at a glance."
        actions={
          <Link href="/dashboard/admin/vendors" className="btn btn--primary btn--sm">
            <Icon name="shield-check" size={16} />
            Vendor queue
          </Link>
        }
      />

      {error && (
        <Callout tone="danger" icon="alert-triangle">
          {error}
        </Callout>
      )}

      {!stats && !error && <LoadingBlock />}

      {stats && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {stats.vendors.pending > 0 && (
            <Callout tone="warning" icon="alert-triangle">
              <Link href="/dashboard/admin/vendors?status=PENDING" style={{ fontWeight: 600, color: 'inherit' }}>
                {stats.vendors.pending} vendor{stats.vendors.pending !== 1 ? 's' : ''} awaiting review →
              </Link>
            </Callout>
          )}

          <section>
            <h2 className="dash-section-heading">Vendors</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 }}>
              <StatCard label="Total" value={stats.vendors.total} icon="building" />
              <StatCard label="Pending" value={stats.vendors.pending} icon="alert-triangle" />
              <StatCard label="Approved" value={stats.vendors.approved} icon="check-circle" />
              <StatCard label="Rejected" value={stats.vendors.rejected} icon="x" />
              <StatCard label="Suspended" value={stats.vendors.suspended} icon="alert-triangle" />
            </div>
          </section>

          <section>
            <h2 className="dash-section-heading">Activity</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 }}>
              <StatCard label="Registered users" value={stats.users} icon="users" />
              <StatCard label="Inquiries" value={stats.inquiries} icon="inbox" />
              <StatCard label="Reviews" value={stats.reviews} icon="star-filled" />
            </div>
          </section>
        </div>
      )}

      <style>{`
        .dash-section-heading {
          font-size: 12px; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase;
          color: var(--text-muted); margin-bottom: 12px;
        }
      `}</style>
    </DashboardShell>
  );
}
