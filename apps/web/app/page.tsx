import Link from 'next/link';
import type { Metadata } from 'next';
import { getCategories, getCities, getPlatformStats } from '../lib/api/server';
import { Icon, categoryIcon } from '../components/ui/icons';

export const metadata: Metadata = {
  title: 'VendorsLK — Find Vendors for Any Occasion in Sri Lanka',
};

// Always reflect live marketplace figures rather than build-time data.
export const dynamic = 'force-dynamic';

const STEPS = [
  {
    num: '01',
    icon: 'search' as const,
    title: 'Search & Discover',
    body: 'Browse verified vendors across Sri Lanka by category, city and budget.',
  },
  {
    num: '02',
    icon: 'message-circle' as const,
    title: 'Contact & Compare',
    body: 'Send inquiries directly to vendors, get quotes, and compare packages and reviews.',
  },
  {
    num: '03',
    icon: 'check-circle' as const,
    title: 'Book with Confidence',
    body: 'Read genuine reviews from real customers, confirm your vendors, and plan with ease.',
  },
];

export default async function HomePage() {
  const [categories, cities, stats] = await Promise.all([
    getCategories(),
    getCities(),
    getPlatformStats(),
  ]);

  const heroCities = cities.slice(0, 6);
  const cityOptions = cities.length > 0 ? cities.map((c) => c.city) : [];
  const quickCategories = [...categories]
    .sort((a, b) => (b.vendorCount ?? 0) - (a.vendorCount ?? 0))
    .slice(0, 6);

  const trustItems = stats
    ? [
        { n: `${stats.approvedVendors}`, l: 'Verified Vendors', show: stats.approvedVendors > 0 },
        { n: `${stats.cities}`, l: 'Cities Covered', show: stats.cities > 0 },
        { n: stats.avgRating.toFixed(1), l: 'Average Rating', show: stats.avgRating > 0 },
        { n: `${stats.reviews}`, l: 'Customer Reviews', show: stats.reviews > 0 },
      ].filter((i) => i.show)
    : [];

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section
        style={{
          background: 'linear-gradient(135deg,#140A17 0%,#2A1430 40%,#5B2A63 100%)',
          padding: '80px 20px 100px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {[180, 340, 500].map((size) => (
          <div
            key={size}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%,-50%)',
              width: size,
              height: size,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.06)',
              pointerEvents: 'none',
            }}
          />
        ))}

        <div style={{ position: 'relative', maxWidth: 760, margin: '0 auto' }}>
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#DAB7E0',
              marginBottom: 18,
            }}
          >
            Sri Lanka&apos;s Event Vendor Marketplace
          </p>
          <h1 style={{ fontSize: 'clamp(36px,6vw,60px)', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.12, marginBottom: 20 }}>
            Find the Right Vendor
            <br />
            <span style={{ color: '#DAB7E0' }}>for Every Occasion</span>
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.75)', marginBottom: 44, lineHeight: 1.6 }}>
            Photographers, venues, caterers, makeup artists and more —
            {stats && stats.approvedVendors > 0
              ? ` connect with ${stats.approvedVendors} verified vendors across the island.`
              : ' all in one place.'}
          </p>

          <form
            action="/vendors"
            method="get"
            style={{
              display: 'flex',
              background: '#FFFFFF',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
              maxWidth: 640,
              margin: '0 auto',
            }}
          >
            <input
              name="q"
              type="text"
              placeholder="Search vendors, photographers, venues…"
              aria-label="Search vendors"
              style={{ flex: 1, padding: '16px 20px', border: 'none', outline: 'none', fontSize: 15, color: 'var(--text)', background: 'transparent' }}
            />
            {cityOptions.length > 0 && (
              <select
                name="city"
                aria-label="Filter by city"
                style={{
                  padding: '16px',
                  border: 'none',
                  borderLeft: '1px solid var(--border)',
                  outline: 'none',
                  fontSize: 14,
                  color: 'var(--text-sec)',
                  background: 'transparent',
                  cursor: 'pointer',
                  minWidth: 130,
                }}
              >
                <option value="">All cities</option>
                {cityOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}
            <button
              type="submit"
              style={{
                padding: '16px 28px',
                background: 'var(--primary)',
                color: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
                fontSize: 15,
                fontWeight: 700,
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
              }}
            >
              <Icon name="search" size={16} />
              Search
            </button>
          </form>

          {quickCategories.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 24 }}>
              {quickCategories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/vendors?categorySlug=${c.slug}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 14px',
                    background: 'rgba(255,255,255,0.12)',
                    borderRadius: 'var(--radius-full)',
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: 13,
                    fontWeight: 500,
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  <Icon name={categoryIcon(c.slug)} size={14} />
                  {c.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── TRUST BAR ────────────────────────────────────────── */}
      {trustItems.length > 0 && (
        <section style={{ background: 'var(--primary-bg)', borderBottom: '1px solid var(--primary-light)' }}>
          <div
            className="container"
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 48, padding: '20px', flexWrap: 'wrap' }}
          >
            {trustItems.map((s) => (
              <div key={s.l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>{s.n}</div>
                <div style={{ fontSize: 13, color: 'var(--text-sec)' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── CATEGORIES ───────────────────────────────────────── */}
      {categories.length > 0 && (
        <section style={{ padding: '72px 20px' }}>
          <div className="container">
            <h2 className="section-title" style={{ textAlign: 'center' }}>
              Browse by Category
            </h2>
            <p className="section-sub" style={{ textAlign: 'center' }}>
              Everything you need for your next event
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 16 }}>
              {categories.map((cat) => (
                <Link key={cat.slug} href={`/vendors?categorySlug=${cat.slug}`} className="category-card">
                  <span
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 12,
                    }}
                  >
                    <Icon name={categoryIcon(cat.slug)} size={22} />
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{cat.name}</span>
                  {typeof cat.vendorCount === 'number' && cat.vendorCount > 0 && (
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                      {cat.vendorCount} vendor{cat.vendorCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── BROWSE BY CITY ───────────────────────────────────── */}
      {heroCities.length > 0 && (
        <section style={{ padding: '64px 20px', background: 'var(--surface)' }}>
          <div className="container">
            <h2 className="section-title" style={{ textAlign: 'center' }}>
              Browse by City
            </h2>
            <p className="section-sub" style={{ textAlign: 'center' }}>
              Find vendors near your event
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 16 }}>
              {heroCities.map((city) => (
                <Link
                  key={city.city}
                  href={`/vendors?city=${encodeURIComponent(city.city)}`}
                  className="city-card"
                  style={{ background: 'var(--primary)' }}
                >
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>{city.city}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.82)' }}>
                    {city.vendorCount} vendor{city.vendorCount !== 1 ? 's' : ''}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section style={{ padding: '72px 20px' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center' }}>
            How VendorsLK Works
          </h2>
          <p className="section-sub" style={{ textAlign: 'center' }}>
            From discovery to a booked vendor in three simple steps
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 24 }}>
            {STEPS.map((step) => (
              <div
                key={step.num}
                style={{
                  padding: '36px 28px',
                  background: 'var(--white)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: -14,
                    left: 28,
                    background: 'var(--primary)',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-full)',
                    letterSpacing: '0.06em',
                  }}
                >
                  STEP {step.num}
                </div>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                  }}
                >
                  <Icon name={step.icon} size={24} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{step.title}</h3>
                <p style={{ color: 'var(--text-sec)', lineHeight: 1.7, fontSize: 14 }}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VENDOR CTA ───────────────────────────────────────── */}
      <section
        style={{ background: 'linear-gradient(135deg,#140A17 0%,#2A1430 100%)', padding: '72px 20px', textAlign: 'center' }}
      >
        <div style={{ maxWidth: 580, margin: '0 auto' }}>
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#DAB7E0',
              marginBottom: 14,
            }}
          >
            Are you a vendor?
          </p>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#FFFFFF', marginBottom: 16, lineHeight: 1.2 }}>
            Grow Your Business
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.72)', marginBottom: 36, lineHeight: 1.7 }}>
            List your business on VendorsLK and connect with customers planning events across Sri Lanka.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register?role=VENDOR" className="btn btn--primary btn--lg">
              List your business — it&apos;s free
            </Link>
            <Link
              href="/vendors"
              className="btn btn--lg"
              style={{ border: '1.5px solid rgba(255,255,255,0.3)', color: '#FFFFFF' }}
            >
              Browse vendors
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
