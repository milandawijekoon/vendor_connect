import { Suspense } from 'react';
import Link from 'next/link';
import type { CategoryDto, PaginatedResponse, VendorListItemDto } from '@vendorconnect/shared';
import { VendorCard } from '../../components/features/vendors/VendorCard';
import { VendorFilters } from '../../components/features/vendors/VendorFilters';

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1';

async function fetchVendors(params: Record<string, string | string[] | undefined>): Promise<PaginatedResponse<VendorListItemDto>> {
  const qs = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val) qs.set(key, Array.isArray(val) ? (val[0] ?? '') : val);
  }
  try {
    const res = await fetch(`${API_URL}/vendors?${qs.toString()}`, { cache: 'no-store' });
    if (!res.ok) return { data: [], total: 0, page: 1, limit: 12, totalPages: 0 };
    return res.json() as Promise<PaginatedResponse<VendorListItemDto>>;
  } catch { return { data: [], total: 0, page: 1, limit: 12, totalPages: 0 }; }
}

async function fetchCategories(): Promise<CategoryDto[]> {
  try {
    const res = await fetch(`${API_URL}/categories`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    return res.json() as Promise<CategoryDto[]>;
  } catch { return []; }
}

function buildUrl(base: Record<string, string | string[] | undefined>, overrides: Record<string, string>) {
  const params = new URLSearchParams();
  for (const [key, val] of Object.entries(base)) {
    if (val && key !== 'page') params.set(key, Array.isArray(val) ? (val[0] ?? '') : val);
  }
  for (const [key, val] of Object.entries(overrides)) {
    if (val) params.set(key, val); else params.delete(key);
  }
  const qs = params.toString();
  return `/vendors${qs ? `?${qs}` : ''}`;
}

interface PageProps { searchParams: Record<string, string | string[] | undefined>; }

const pageLinkStyle: React.CSSProperties = {
  padding: '8px 14px', border: '1.5px solid var(--border)',
  borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'var(--text)', fontSize: 14,
  background: 'var(--white)', transition: 'border-color 0.15s',
};
const activePageStyle: React.CSSProperties = {
  background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)',
};

export default async function VendorsPage({ searchParams }: PageProps) {
  const [result, categories] = await Promise.all([fetchVendors(searchParams), fetchCategories()]);
  const currentPage = parseInt(
    (Array.isArray(searchParams['page']) ? searchParams['page'][0] : searchParams['page']) ?? '1', 10,
  );
  const activeCategory = categories.find(
    (c) => c.slug === (Array.isArray(searchParams['categorySlug']) ? searchParams['categorySlug'][0] : searchParams['categorySlug'])
  );
  const activeCity = Array.isArray(searchParams['city']) ? searchParams['city'][0] : searchParams['city'];

  const pageTitle = activeCategory
    ? `${activeCategory.name} in ${activeCity ?? 'Sri Lanka'}`
    : activeCity
      ? `Wedding Vendors in ${activeCity}`
      : 'All Wedding Vendors';

  return (
    <>
      {/* Sub-header */}
      <div style={{ background: 'var(--primary-bg)', borderBottom: '1px solid var(--primary-light)', padding: '20px 0' }}>
        <div className="container">
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-sec)', marginBottom: 10 }}>
            <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
            <span>›</span>
            <span style={{ color: 'var(--text)' }}>Vendors</span>
            {activeCategory && <><span>›</span><span style={{ color: 'var(--primary)', fontWeight: 600 }}>{activeCategory.name}</span></>}
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)', margin: 0 }}>{pageTitle}</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-sec)', fontSize: 14 }}>
            {result.total > 0
              ? `${result.total} vendor${result.total !== 1 ? 's' : ''} available`
              : 'No vendors found — try different filters'}
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 20px 64px', display: 'flex', gap: 32, alignItems: 'flex-start' }}>
        {/* Filters sidebar */}
        <aside style={{
          width: 240, flexShrink: 0,
          position: 'sticky', top: 'calc(var(--nav-h) + 16px)',
          background: 'var(--white)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 20px 16px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: 'var(--text)' }}>
            🔧 Filters
          </p>
          <Suspense fallback={null}>
            <VendorFilters categories={categories} />
          </Suspense>
        </aside>

        {/* Results */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {result.data.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '80px 20px',
              background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No vendors found</h3>
              <p style={{ color: 'var(--text-sec)', marginBottom: 24 }}>Try removing some filters or search with different terms.</p>
              <Link href="/vendors" style={{
                padding: '10px 24px', background: 'var(--primary)',
                color: '#fff', borderRadius: 'var(--radius-md)',
                fontWeight: 600, fontSize: 14,
              }}>
                Browse all vendors
              </Link>
            </div>
          ) : (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
                gap: 20, marginBottom: 40,
              }}>
                {result.data.map((vendor) => <VendorCard key={vendor.id} vendor={vendor} />)}
              </div>

              {result.totalPages > 1 && (
                <nav style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }} aria-label="Pagination">
                  {currentPage > 1 && (
                    <Link href={buildUrl(searchParams, { page: String(currentPage - 1) })} style={pageLinkStyle}>← Prev</Link>
                  )}
                  {Array.from({ length: result.totalPages }, (_, i) => i + 1)
                    .filter((p) => Math.abs(p - currentPage) <= 2 || p === 1 || p === result.totalPages)
                    .reduce<(number | '…')[]>((acc, p, i, arr) => {
                      if (i > 0 && (arr[i - 1] as number) + 1 < p) acc.push('…');
                      acc.push(p); return acc;
                    }, [])
                    .map((item, i) =>
                      item === '…' ? (
                        <span key={`e-${i}`} style={{ padding: '6px 4px', color: 'var(--text-muted)' }}>…</span>
                      ) : (
                        <Link key={item} href={buildUrl(searchParams, { page: String(item) })}
                          style={{ ...pageLinkStyle, ...(item === currentPage ? activePageStyle : {}) }}>
                          {item}
                        </Link>
                      )
                    )}
                  {currentPage < result.totalPages && (
                    <Link href={buildUrl(searchParams, { page: String(currentPage + 1) })} style={pageLinkStyle}>Next →</Link>
                  )}
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
