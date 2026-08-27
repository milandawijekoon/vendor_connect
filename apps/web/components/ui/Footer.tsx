import Link from 'next/link';
import { getCities } from '../../lib/api/server';
import { Logo } from './Logo';

const COLS = [
  {
    heading: 'For Customers',
    links: [
      { label: 'Browse Vendors', href: '/vendors' },
      { label: 'Photographers', href: '/vendors?categorySlug=photography' },
      { label: 'Venues', href: '/vendors?categorySlug=venues' },
      { label: 'Catering', href: '/vendors?categorySlug=catering' },
      { label: 'Decorators', href: '/vendors?categorySlug=decoration' },
    ],
  },
  {
    heading: 'For Vendors',
    links: [
      { label: 'List Your Business', href: '/register?role=VENDOR' },
      { label: 'Vendor Dashboard', href: '/dashboard/vendor' },
      { label: 'Manage Inquiries', href: '/dashboard/vendor/inquiries' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
];

export async function Footer() {
  const cities = (await getCities()).slice(0, 8);

  return (
    <footer style={{ background: '#0E1A14', color: '#CBD5E1', marginTop: 64 }}>
      <div
        className="container footer-grid"
        style={{ padding: '56px 20px 40px', display: 'grid', gridTemplateColumns: '1.4fr repeat(3, 1fr)', gap: 48 }}
      >
        <div>
          <Logo size={28} wordmarkColor="#FFFFFF" brandColor="#8FD9B5" />
          <p style={{ fontSize: 14, lineHeight: 1.7, maxWidth: 280, color: '#94A3B8', marginTop: 14 }}>
            Sri Lanka&apos;s event vendor marketplace. Find trusted vendors for weddings, parties,
            corporate events and every occasion in between.
          </p>

          {cities.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#64748B',
                  marginBottom: 10,
                }}
              >
                Popular Cities
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {cities.map((c) => (
                  <Link key={c.city} href={`/vendors?city=${encodeURIComponent(c.city)}`} className="footer-city-pill">
                    {c.city}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {COLS.map((col) => (
          <div key={col.heading}>
            <p
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: '#F1F5F9',
                marginBottom: 16,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {col.heading}
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="footer-link">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid #1B2B22' }}>
        <div
          className="container"
          style={{
            padding: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <p style={{ fontSize: 13, color: '#64748B' }}>
            © {new Date().getFullYear()} VendorConnect (Pvt) Ltd. All rights reserved.
          </p>
          <p style={{ fontSize: 13, color: '#64748B' }}>Colombo, Sri Lanka</p>
        </div>
      </div>

      <style>{`
        @media (max-width: 760px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 32px !important; }
        }
        @media (max-width: 460px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
