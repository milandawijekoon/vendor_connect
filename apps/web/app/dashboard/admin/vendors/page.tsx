'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { AdminVendorDto, VendorStatus } from '@vendorconnect/shared';
import { Role, VendorStatus as VS } from '@vendorconnect/shared';
import { adminApi } from '../../../../lib/api/admin';
import { ApiClientError } from '../../../../lib/api/client';
import { DashboardShell } from '../../../../components/ui/DashboardShell';
import {
  Badge,
  Button,
  EmptyState,
  LoadingBlock,
  PageHeader,
  Pagination,
  VENDOR_STATUS_TONE,
} from '../../../../components/ui/primitives';
import { Icon } from '../../../../components/ui/icons';

type ActionSpec = { label: string; next: VendorStatus; variant: 'primary' | 'danger' | 'outline' };

const ACTIONS: Partial<Record<VendorStatus, ActionSpec[]>> = {
  [VS.PENDING]: [
    { label: 'Approve', next: VS.APPROVED, variant: 'primary' },
    { label: 'Reject', next: VS.REJECTED, variant: 'danger' },
  ],
  [VS.APPROVED]: [{ label: 'Suspend', next: VS.SUSPENDED, variant: 'outline' }],
  [VS.REJECTED]: [{ label: 'Approve', next: VS.APPROVED, variant: 'primary' }],
  [VS.SUSPENDED]: [
    { label: 'Reinstate', next: VS.APPROVED, variant: 'primary' },
    { label: 'Reject', next: VS.REJECTED, variant: 'danger' },
  ],
};

const TABS: { label: string; value: VendorStatus | '' }[] = [
  { label: 'All', value: '' },
  { label: 'Pending', value: VS.PENDING },
  { label: 'Approved', value: VS.APPROVED },
  { label: 'Rejected', value: VS.REJECTED },
  { label: 'Suspended', value: VS.SUSPENDED },
];

const LIMIT = 20;

export default function AdminVendorsPage() {
  return (
    <Suspense
      fallback={
        <DashboardShell requireRole={Role.ADMIN}>
          <LoadingBlock />
        </DashboardShell>
      }
    >
      <AdminVendorsPageInner />
    </Suspense>
  );
}

function AdminVendorsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusParam = (searchParams.get('status') ?? '') as VendorStatus | '';

  const [vendors, setVendors] = useState<AdminVendorDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [statusParam]);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    adminApi
      .listVendors({ ...(statusParam ? { status: statusParam } : {}), page, limit: LIMIT })
      .then((res) => {
        setVendors(res.data);
        setTotal(res.total);
      })
      .catch((err) => setError(err instanceof ApiClientError ? err.message : 'Failed to load vendors'))
      .finally(() => setIsLoading(false));
  }, [statusParam, page]);

  const handleStatusUpdate = async (id: string, status: VendorStatus) => {
    setUpdating(id);
    try {
      const updated = await adminApi.updateVendorStatus(id, status);
      setVendors((prev) => prev.map((v) => (v.id === id ? updated : v)));
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to update status');
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

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <DashboardShell requireRole={Role.ADMIN}>
      <PageHeader
        eyebrow="Admin"
        title="Vendor queue"
        description={`${total} vendor${total !== 1 ? 's' : ''}`}
        breadcrumb={
          <Link
            href="/dashboard/admin"
            style={{ fontSize: 13, color: 'var(--text-sec)', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 8 }}
          >
            <Icon name="chevron-left" size={14} />
            Overview
          </Link>
        }
      />

      <div className="tabs" style={{ marginBottom: 24 }}>
        {TABS.map((tab) => (
          <button
            key={tab.value}
            className={`tab ${tab.value === statusParam ? 'tab--active' : ''}`}
            onClick={() => setTab(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="callout callout--danger" style={{ marginBottom: 16 }}>
          <Icon name="alert-triangle" size={16} />
          {error}
        </p>
      )}

      {isLoading ? (
        <LoadingBlock />
      ) : vendors.length === 0 ? (
        <EmptyState icon="shield-check" title="Nothing here" body="No vendors match the current filter." />
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {vendors.map((vendor) => {
              const meta = VENDOR_STATUS_TONE[vendor.status] ?? { tone: 'neutral' as const, label: vendor.status };
              const actions = ACTIONS[vendor.status] ?? [];
              return (
                <div
                  key={vendor.id}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '16px 18px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 14,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{vendor.businessName}</span>
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                    </div>
                    <p style={{ margin: 0, color: 'var(--text-sec)', fontSize: 13 }}>
                      {vendor.city} · {vendor.owner.name} · {vendor.owner.email}
                    </p>
                    <p style={{ margin: '3px 0 0', color: 'var(--text-muted)', fontSize: 12 }}>
                      Registered{' '}
                      {new Date(vendor.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                      {vendor.reviewCount > 0 && ` · ${vendor.avgRating.toFixed(1)}★ (${vendor.reviewCount})`}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Link
                      href={`/vendors/${vendor.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn--ghost btn--sm"
                    >
                      <Icon name="external-link" size={14} />
                      View
                    </Link>
                    {actions.map((action) => (
                      <Button
                        key={action.next}
                        variant={action.variant}
                        size="sm"
                        loading={updating === vendor.id}
                        onClick={() => void handleStatusUpdate(vendor.id, action.next)}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        </>
      )}
    </DashboardShell>
  );
}
