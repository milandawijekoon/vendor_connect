import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'VendorConnect — Find Wedding Vendors in Sri Lanka' };

const CATEGORIES = [
  { icon: '📷', name: 'Photography', slug: 'photography' },
  { icon: '🏛️', name: 'Venues',       slug: 'venues' },
  { icon: '💄', name: 'Makeup',       slug: 'makeup' },
  { icon: '🎂', name: 'Catering',     slug: 'catering' },
  { icon: '💐', name: 'Decoration',   slug: 'decoration' },
  { icon: '🎵', name: 'Music & DJ',   slug: 'music' },
  { icon: '🎬', name: 'Videography',  slug: 'videography' },
  { icon: '👗', name: 'Bridal Wear',  slug: 'bridal-wear' },
  { icon: '🚗', name: 'Transport',    slug: 'transport' },
  { icon: '💍', name: 'Jewelry',      slug: 'jewelry' },
];

const CITIES = [
  { name: 'Colombo',  count: '120+', gradient: 'linear-gradient(135deg,#1F6B4E,#D4A93A)' },
  { name: 'Kandy',    count: '80+',  gradient: 'linear-gradient(135deg,#154B37,#1F6B4E)' },
  { name: 'Galle',    count: '60+',  gradient: 'linear-gradient(135deg,#0F766E,#1F6B4E)' },
  { name: 'Negombo',  count: '45+',  gradient: 'linear-gradient(135deg,#B25F1D,#D4A93A)' },
  { name: 'Jaffna',   count: '30+',  gradient: 'linear-gradient(135deg,#2E7D5B,#0F766E)' },
  { name: 'Matara',   count: '25+',  gradient: 'linear-gradient(135deg,#3D6B4F,#D4A93A)' },
];

const STEPS = [
  { num: '01', icon: '🔍', title: 'Search & Discover', body: 'Browse thousands of verified wedding vendors across Sri Lanka by category, city and budget.' },
  { num: '02', icon: '💬', title: 'Contact & Compare',  body: 'Send inquiries directly to vendors, get quotes, and compare their packages and reviews.' },
  { num: '03', icon: '✅', title: 'Book with Confidence', body: 'Read genuine reviews from real couples, confirm your vendors and plan your dream wedding.' },
];

export default function HomePage() {
  return (
    <>
      {/* ── HERO ────────────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg,#0A1712 0%,#123423 40%,#1F6B4E 100%)',
        padding: '80px 20px 100px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {[180, 340, 500].map((size) => (
          <div key={size} style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            width: size, height: size, borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.06)', pointerEvents: 'none',
          }} />
        ))}

        <div style={{ position: 'relative', maxWidth: 760, margin: '0 auto' }}>
          <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8FD9B5', marginBottom: 18 }}>
            #1 Wedding Vendor Marketplace in Sri Lanka
          </p>
          <h1 style={{ fontSize: 'clamp(36px,6vw,60px)', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.12, marginBottom: 20 }}>
            Plan Your Perfect<br />
            <span style={{ color: '#8FD9B5' }}>Sri Lanka Wedding</span>
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.75)', marginBottom: 44, lineHeight: 1.6 }}>
            Discover photographers, venues, caterers, makeup artists and more.<br />
            Connect with 500+ verified vendors across Sri Lanka.
          </p>

          {/* Search bar */}
          <form action="/vendors" method="get" style={{
            display: 'flex', background: '#FFFFFF',
            borderRadius: 12, overflow: 'hidden',
            boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
            maxWidth: 640, margin: '0 auto',
          }}>
            <input
              name="q" type="text"
              placeholder="Search vendors, photographers, venues…"
              style={{
                flex: 1, padding: '16px 20px', border: 'none', outline: 'none',
                fontSize: 15, color: 'var(--text)', background: 'transparent',
              }}
            />
            <select name="city" style={{
              padding: '16px 16px', border: 'none', borderLeft: '1px solid var(--border)',
              outline: 'none', fontSize: 14, color: 'var(--text-sec)',
              background: 'transparent', cursor: 'pointer', minWidth: 130,
            }}>
              <option value="">All cities</option>
              {CITIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
            <button type="submit" style={{
              padding: '16px 28px', background: 'var(--primary)', color: '#FFFFFF',
              border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 700,
              transition: 'background 0.18s', whiteSpace: 'nowrap',
            }}>
              Search
            </button>
          </form>

          {/* Quick pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 24 }}>
            {CATEGORIES.slice(0, 6).map((c) => (
              <Link key={c.slug} href={`/vendors?categorySlug=${c.slug}`} style={{
                padding: '6px 16px',
                background: 'rgba(255,255,255,0.12)',
                borderRadius: 'var(--radius-full)',
                color: 'rgba(255,255,255,0.88)',
                fontSize: 13, fontWeight: 500,
                border: '1px solid rgba(255,255,255,0.2)',
              }}>
                {c.icon} {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ────────────────────────────────────────────── */}
      <section style={{ background: 'var(--primary-bg)', borderBottom: '1px solid var(--primary-light)' }}>
        <div className="container" style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          gap: 48, padding: '20px 20px', flexWrap: 'wrap',
        }}>
          {[
            { n: '500+',  l: 'Verified Vendors' },
            { n: '5,000+', l: 'Happy Couples' },
            { n: '14',    l: 'Cities Covered' },
            { n: '4.8★',  l: 'Average Rating' },
          ].map((s) => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>{s.n}</div>
              <div style={{ fontSize: 13, color: 'var(--text-sec)' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────────────── */}
      <section style={{ padding: '72px 20px' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center' }}>Browse by Category</h2>
          <p className="section-sub" style={{ textAlign: 'center' }}>Everything you need for your perfect wedding day</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(110px,1fr))', gap: 16 }}>
            {CATEGORIES.map((cat) => (
              <Link key={cat.slug} href={`/vendors?categorySlug=${cat.slug}`} className="category-card">
                <span style={{ fontSize: 32, marginBottom: 10 }}>{cat.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── BROWSE BY CITY ───────────────────────────────────────── */}
      <section style={{ padding: '64px 20px', background: 'var(--surface)' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center' }}>Browse by City</h2>
          <p className="section-sub" style={{ textAlign: 'center' }}>Find vendors near your wedding venue</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 16 }}>
            {CITIES.map((city) => (
              <Link key={city.name} href={`/vendors?city=${city.name}`} className="city-card" style={{ background: city.gradient }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>{city.name}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.82)' }}>{city.count} vendors</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section style={{ padding: '72px 20px' }}>
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center' }}>How VendorConnect Works</h2>
          <p className="section-sub" style={{ textAlign: 'center' }}>From discovery to your dream wedding in three simple steps</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 24 }}>
            {STEPS.map((step) => (
              <div key={step.num} style={{
                padding: '36px 28px',
                background: 'var(--white)',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', top: -16, left: 28,
                  background: 'var(--primary)', color: '#fff',
                  fontSize: 11, fontWeight: 800,
                  padding: '4px 12px', borderRadius: 'var(--radius-full)',
                  letterSpacing: '0.06em',
                }}>
                  STEP {step.num}
                </div>
                <div style={{ fontSize: 40, marginBottom: 16 }}>{step.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{step.title}</h3>
                <p style={{ color: 'var(--text-sec)', lineHeight: 1.7, fontSize: 14 }}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VENDOR CTA ───────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg,#0A1712 0%,#123423 100%)',
        padding: '72px 20px', textAlign: 'center',
      }}>
        <div style={{ maxWidth: 580, margin: '0 auto' }}>
          <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8FD9B5', marginBottom: 14 }}>
            Are you a vendor?
          </p>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#FFFFFF', marginBottom: 16, lineHeight: 1.2 }}>
            Grow Your Wedding Business
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.72)', marginBottom: 36, lineHeight: 1.7 }}>
            List your business on VendorConnect and connect with thousands of couples planning their dream wedding across Sri Lanka.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register?role=VENDOR" className="btn-primary" style={{ fontSize: 16, padding: '13px 32px' }}>
              List your business — It&apos;s Free
            </Link>
            <Link href="/vendors" style={{
              padding: '13px 28px',
              border: '1.5px solid rgba(255,255,255,0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#FFFFFF', fontSize: 15, fontWeight: 500,
            }}>
              Browse vendors
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
