import { Suspense } from 'react';
import Link from 'next/link';
import type { CategoryDto, CityStatDto, PaginatedResponse, VendorListItemDto } from '@vendorconnect/shared';
import { VendorCard } from '../../components/features/vendors/VendorCard';
import { VendorFilters } from '../../components/features/vendors/VendorFilters';
import { Icon } from '../../components/ui/icons';
import { EmptyState, Pagination } from '../../components/ui/primitives';

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1';

async function fetchVendors(
  params: Record<string, string | string[] | undefined>,
): Promise<PaginatedResponse<VendorListItemDto>> {
  const qs = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val) qs.set(key, Array.isArray(val) ? (val[0] ?? '') : val);
  }
  try {
    const res = await fetch(`${API_URL}/vendors?${qs.toString()}`, { cache: 'no-store' });
    if (!res.ok) return { data: [], total: 0, page: 1, limit: 12, totalPages: 0 };
    return res.json() as Promise<PaginatedResponse<VendorListItemDto>>;
  } catch {
    return { data: [], total: 0, page: 1, limit: 12, totalPages: 0 };
  }
}

async function fetchJson<T>(path: string, fallback: T, revalidate: number): Promise<T> {
  try {
    const res = await fetch(`${API_URL}${path}`, { next: { revalidate } });
    if (!res.ok) return fallback;
    return res.json() as Promise<T>;
  } catch {
    return fallback;
  }
}

function buildUrl(base: Record<string, string | string[] | undefined>, overrides: Record<string, string>) {
  const params = new URLSearchParams();
  for (const [key, val] of Object.entries(base)) {
    if (val && key !== 'page') params.set(key, Array.isArray(val) ? (val[0] ?? '') : val);
  }
  for (const [key, val] of Object.entries(overrides)) {
    if (val) params.set(key, val);
    else params.delete(key);
  }
  const qs = params.toString();
  return `/vendors${qs ? `?${qs}` : ''}`;
}

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function VendorsPage({ searchParams }: PageProps) {
  const [result, categories, cities] = await Promise.all([
    fetchVendors(searchParams),
    fetchJson<CategoryDto[]>('/categories', [], 3600),
    fetchJson<CityStatDto[]>('/meta/cities', [], 300),
  ]);

  const currentPage = parseInt(
    (Array.isArray(searchParams['page']) ? searchParams['page'][0] : searchParams['page']) ?? '1',
    10,
  );
  const activeCategory = categories.find(
    (c) =>
      c.slug ===
      (Array.isArray(searchParams['categorySlug']) ? searchParams['categorySlug'][0] : searchParams['categorySlug']),
  );
  const activeCity = Array.isArray(searchParams['city']) ? searchParams['city'][0] : searchParams['city'];

  const pageTitle = activeCategory
    ? `${activeCategory.name} in ${activeCity ?? 'Sri Lanka'}`
    : activeCity
      ? `Vendors in ${activeCity}`
      : 'All Vendors';

  return (
    <>
      <div style={{ background: 'var(--primary-bg)', borderBottom: '1px solid var(--primary-light)', padding: '20px 0' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              color: 'var(--text-sec)',
              marginBottom: 10,
            }}
          >
            <Link href="/" style={{ color: 'var(--text-muted)' }}>
              Home
            </Link>
            <Icon name="chevron-right" size={13} style={{ color: 'var(--text-muted)' }} />
            <span style={{ color: 'var(--text)' }}>Vendors</span>
            {activeCategory && (
              <>
                <Icon name="chevron-right" size={13} style={{ color: 'var(--text-muted)' }} />
                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{activeCategory.name}</span>
              </>
            )}
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)', margin: 0 }}>{pageTitle}</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-sec)', fontSize: 14 }}>
            {result.total > 0
              ? `${result.total} vendor${result.total !== 1 ? 's' : ''} available`
              : 'No vendors found — try different filters'}
          </p>
        </div>
      </div>

      <div className="container vendors-layout" style={{ padding: '32px 20px 64px', display: 'flex', gap: 32, alignItems: 'flex-start' }}>
        <aside
          className="vendors-filters"
          style={{
            width: 250,
            flexShrink: 0,
            position: 'sticky',
            top: 'calc(var(--nav-h) + 16px)',
            background: 'var(--white)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px 20px 16px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <p
            style={{
              fontSize: 15,
              fontWeight: 700,
              marginBottom: 20,
              color: 'var(--text)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Icon name="sliders" size={17} />
            Filters
          </p>
          <Suspense fallback={null}>
            <VendorFilters categories={categories} cities={cities.map((c) => c.city)} />
          </Suspense>
        </aside>

        <div style={{ flex: 1, minWidth: 0 }}>
          {result.data.length === 0 ? (
            <EmptyState
              icon="search"
              title="No vendors found"
              body="Try removing some filters or searching with different terms."
              action={
                <Link href="/vendors" className="btn btn--primary btn--sm">
                  Browse all vendors
                </Link>
              }
            />
          ) : (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
                  gap: 20,
                  marginBottom: 8,
                }}
              >
                {result.data.map((vendor) => (
                  <VendorCard key={vendor.id} vendor={vendor} />
                ))}
              </div>

              <Pagination
                page={currentPage}
                totalPages={result.totalPages}
                hrefFor={(p) => buildUrl(searchParams, { page: String(p) })}
              />
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 820px) {
          .vendors-layout { flex-direction: column; }
          .vendors-filters { width: 100% !important; position: static !important; }
        }
      `}</style>
    </>
  );
}
