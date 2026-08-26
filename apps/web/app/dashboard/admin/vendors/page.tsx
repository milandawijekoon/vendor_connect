'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { AdminVendorDto, VendorStatus } from '@vendorconnect/shared';
import { Role, VendorStatus as VS } from '@vendorconnect/shared';
import { useAuth } from '../../../../lib/auth/context';
import { adminApi } from '../../../../lib/api/admin';
import { ApiClientError } from '../../../../lib/api/client';

const STATUS_META: Record<VendorStatus, { label: string; color: string; bg: string }> = {
  PENDING:   { label: 'Pending',   color: '#92400e', bg: '#fef3c7' },
  APPROVED:  { label: 'Approved',  color: '#14532d', bg: '#dcfce7' },
  REJECTED:  { label: 'Rejected',  color: '#991b1b', bg: '#fee2e2' },
  SUSPENDED: { label: 'Suspended', color: '#374151', bg: '#f3f4f6' },
};

// Which actions are available per current status
const ACTIONS: Partial<Record<VendorStatus, { label: string; next: VendorStatus; style: React.CSSProperties }[]>> = {
  [VS.PENDING]:   [
    { label: 'Approve',  next: VS.APPROVED,  style: { background: '#16a34a', color: '#fff', borderColor: '#16a34a' } },
    { label: 'Reject',   next: VS.REJECTED,  style: { background: '#dc2626', color: '#fff', borderColor: '#dc2626' } },
  ],
  [VS.APPROVED]:  [
    { label: 'Suspend',  next: VS.SUSPENDED, style: { background: '#6b7280', color: '#fff', borderColor: '#6b7280' } },
  ],
  [VS.REJECTED]:  [
    { label: 'Approve',  next: VS.APPROVED,  style: { background: '#16a34a', color: '#fff', borderColor: '#16a34a' } },
  ],
  [VS.SUSPENDED]: [
    { label: 'Reinstate', next: VS.APPROVED, style: { background: '#16a34a', color: '#fff', borderColor: '#16a34a' } },
    { label: 'Reject',    next: VS.REJECTED, style: { background: '#dc2626', color: '#fff', borderColor: '#dc2626' } },
  ],
};

const TABS: { label: string; value: VendorStatus | '' }[] = [
  { label: 'All',       value: '' },
  { label: 'Pending',   value: VS.PENDING },
  { label: 'Approved',  value: VS.APPROVED },
  { label: 'Rejected',  value: VS.REJECTED },
  { label: 'Suspended', value: VS.SUSPENDED },
];

export default function AdminVendorsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusParam = (searchParams.get('status') ?? '') as VendorStatus | '';

  const [vendors, setVendors] = useState<AdminVendorDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const limit = 20;

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== Role.ADMIN) {
      router.replace('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    setPage(1);
  }, [statusParam]);

  useEffect(() => {
    if (!user || user.role !== Role.ADMIN) return;
    setIsLoading(true);
    setError(null);
    adminApi
      .listVendors({ ...(statusParam ? { status: statusParam } : {}), page, limit })
      .then((res) => { setVendors(res.data); setTotal(res.total); })
      .catch((err) => setError(err instanceof ApiClientError ? err.message : 'Failed to load vendors'))
      .finally(() => setIsLoading(false));
  }, [statusParam, page, user]);

  const handleStatusUpdate = async (id: string, status: VendorStatus) => {
    setUpdating(id);
    try {
      const updated = await adminApi.updateVendorStatus(id, status);
      setVendors((prev) => prev.map((v) => (v.id === id ? updated : v)));
    } catch (err) {
      alert(err instanceof ApiClientError ? err.message : 'Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const setTab = (value: VendorStatus | '') => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set('status', value);
    else params.delete('status');
    router.push(`/dashboard/admin/vendors?${params.toString()}`);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <main style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/dashboard/admin" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 14 }}>← Admin</Link>
          <h1 style={{ margin: 0, fontSize: 24 }}>Vendor Queue</h1>
        </div>
        <span style={{ color: '#6b7280', fontSize: 14 }}>{total} vendor{total !== 1 ? 's' : ''}</span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #e5e7eb', marginBottom: 24 }}>
        {TABS.map((tab) => {
          const active = tab.value === statusParam;
          return (
            <button
              key={tab.value}
              onClick={() => setTab(tab.value)}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderBottom: active ? '2px solid #111827' : '2px solid transparent',
                background: 'none',
                fontWeight: active ? 600 : 400,
                color: active ? '#111827' : '#6b7280',
                cursor: 'pointer',
                fontSize: 14,
                marginBottom: -1,
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {error && <p style={{ color: '#dc2626', marginBottom: 16 }}>{error}</p>}

      {isLoading ? (
        <p style={{ color: '#9ca3af' }}>Loading…</p>
      ) : vendors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: '#9ca3af' }}>
          <p style={{ fontSize: 18, margin: '0 0 4px' }}>No vendors</p>
          <p style={{ fontSize: 14 }}>No vendors match the current filter.</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {vendors.map((vendor) => {
              const meta = STATUS_META[vendor.status];
              const actions = ACTIONS[vendor.status] ?? [];
              return (
                <div
                  key={vendor.id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    padding: '14px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: 15 }}>{vendor.businessName}</span>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 600,
                          color: meta.color,
                          background: meta.bg,
                        }}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: 13 }}>
                      {vendor.city} · {vendor.owner.name} · {vendor.owner.email}
                    </p>
                    <p style={{ margin: '2px 0 0', color: '#9ca3af', fontSize: 12 }}>
                      Registered {new Date(vendor.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {vendor.reviewCount > 0 && ` · ⭐ ${vendor.avgRating.toFixed(1)} (${vendor.reviewCount})`}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <a
                      href={`/vendors/${vendor.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 12, color: '#6b7280', textDecoration: 'underline' }}
                    >
                      View profile
                    </a>
                    {actions.map((action) => (
                      <button
                        key={action.next}
                        disabled={updating === vendor.id}
                        onClick={() => void handleStatusUpdate(vendor.id, action.next)}
                        style={{
                          padding: '6px 14px',
                          border: '1px solid',
                          borderRadius: 6,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: updating === vendor.id ? 'not-allowed' : 'pointer',
                          opacity: updating === vendor.id ? 0.5 : 1,
                          ...action.style,
                        }}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: 6, cursor: page === 1 ? 'not-allowed' : 'pointer', background: 'transparent', color: 'inherit', opacity: page === 1 ? 0.4 : 1 }}
              >
                ← Prev
              </button>
              <span style={{ padding: '8px 16px', color: '#6b7280', fontSize: 14 }}>
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: 6, cursor: page === totalPages ? 'not-allowed' : 'pointer', background: 'transparent', color: 'inherit', opacity: page === totalPages ? 0.4 : 1 }}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
