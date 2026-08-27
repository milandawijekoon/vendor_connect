import Link from 'next/link';

const COLS = [
  {
    heading: 'For Customers',
    links: [
      { label: 'Browse Vendors',   href: '/vendors' },
      { label: 'Photographers',    href: '/vendors?categorySlug=photography' },
      { label: 'Venues',           href: '/vendors?categorySlug=venues' },
      { label: 'Catering',         href: '/vendors?categorySlug=catering' },
      { label: 'Decorators',       href: '/vendors?categorySlug=decoration' },
    ],
  },
  {
    heading: 'For Vendors',
    links: [
      { label: 'List Your Business',  href: '/register?role=VENDOR' },
      { label: 'Vendor Dashboard',    href: '/dashboard/vendor' },
      { label: 'Manage Inquiries',    href: '/dashboard/vendor/inquiries' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About Us',         href: '/about' },
      { label: 'Contact',          href: '/contact' },
      { label: 'Privacy Policy',   href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
];

const CITIES = ['Colombo', 'Kandy', 'Galle', 'Negombo', 'Jaffna', 'Matara'];

export function Footer() {
  return (
    <footer style={{ background: '#1A1A2E', color: '#CBD5E1', marginTop: 64 }}>
      <div className="container" style={{
        padding: '56px 20px 40px',
        display: 'grid',
        gridTemplateColumns: '1fr repeat(3,auto)',
        gap: 48,
      }}>
        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ width: 32, height: 32, background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🎉</span>
            <span style={{ fontWeight: 800, fontSize: 18, color: '#FFFFFF' }}>VendorConnect</span>
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.7, maxWidth: 260, color: '#94A3B8' }}>
            Sri Lanka&apos;s most trusted event vendor marketplace. Find the perfect vendors for weddings, parties, corporate events and every occasion.
          </p>

          <div style={{ marginTop: 24 }}>
            <p style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B', marginBottom: 10 }}>
              Popular Cities
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {CITIES.map((city) => (
                <Link key={city} href={`/vendors?city=${city}`} className="footer-city-pill">
                  {city}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Link columns */}
        {COLS.map((col) => (
          <div key={col.heading}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#F1F5F9', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {col.heading}
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="footer-link">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid #1E293B' }}>
        <div className="container" style={{ padding: '20px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 13, color: '#475569' }}>
            © {new Date().getFullYear()} VendorConnect. All rights reserved.
          </p>
          <p style={{ fontSize: 13, color: '#475569' }}>Made with ❤️ in Sri Lanka</p>
        </div>
      </div>
    </footer>
  );
}
