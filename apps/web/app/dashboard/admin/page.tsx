'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { AdminStatsDto } from '@vendorconnect/shared';
import { Role } from '@vendorconnect/shared';
import { useAuth } from '../../../lib/auth/context';
import { adminApi } from '../../../lib/api/admin';
import { ApiClientError } from '../../../lib/api/client';

export default function AdminDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStatsDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== Role.ADMIN) {
      router.replace('/');
      return;
    }
    adminApi
      .getStats()
      .then(setStats)
      .catch((err) => setError(err instanceof ApiClientError ? err.message : 'Failed to load stats'));
  }, [user, authLoading, router]);

  if (authLoading || (!stats && !error)) return <main style={{ padding: 32 }}>Loading…</main>;

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
        <Link
          href="/dashboard/admin/vendors"
          style={{
            padding: '10px 20px',
            background: '#111827',
            color: '#fff',
            borderRadius: 6,
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Vendor Queue →
        </Link>
      </div>

      {error && (
        <p style={{ color: '#dc2626', marginBottom: 24 }}>{error}</p>
      )}

      {stats && (
        <>
          {/* Vendor stats */}
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 16, marginBottom: 12, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Vendors
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
              {[
                { label: 'Total', value: stats.vendors.total, color: '#1d4ed8', bg: '#eff6ff' },
                { label: 'Pending', value: stats.vendors.pending, color: '#d97706', bg: '#fffbeb' },
                { label: 'Approved', value: stats.vendors.approved, color: '#16a34a', bg: '#f0fdf4' },
                { label: 'Rejected', value: stats.vendors.rejected, color: '#dc2626', bg: '#fef2f2' },
                { label: 'Suspended', value: stats.vendors.suspended, color: '#6b7280', bg: '#f9fafb' },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{ padding: '16px 20px', border: '1px solid #e5e7eb', borderRadius: 8, background: s.bg }}
                >
                  <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {stats.vendors.pending > 0 && (
              <div style={{ marginTop: 12, padding: '12px 16px', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 6 }}>
                <Link href="/dashboard/admin/vendors?status=PENDING" style={{ color: '#d97706', fontWeight: 600, textDecoration: 'none', fontSize: 14 }}>
                  {stats.vendors.pending} vendor{stats.vendors.pending !== 1 ? 's' : ''} awaiting approval →
                </Link>
              </div>
            )}
          </section>

          {/* Platform stats */}
          <section>
            <h2 style={{ fontSize: 16, marginBottom: 12, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Platform
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
              {[
                { label: 'Users', value: stats.users },
                { label: 'Inquiries', value: stats.inquiries },
                { label: 'Reviews', value: stats.reviews },
              ].map((s) => (
                <div key={s.label} style={{ padding: '16px 20px', border: '1px solid #e5e7eb', borderRadius: 8 }}>
                  <div style={{ fontSize: 28, fontWeight: 700 }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
