'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth/context';
import { Role } from '@vendorconnect/shared';

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const isStaff = user?.role === Role.ADMIN || user?.role === Role.VENDOR;
  const dashboardHref =
    user?.role === Role.ADMIN
      ? '/dashboard/admin'
      : user?.role === Role.VENDOR
        ? '/dashboard/vendor'
        : '/vendors';

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: 'var(--nav-h)',
      background: 'var(--white)',
      borderBottom: '1px solid var(--border)',
      boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
    }}>
      <div className="container" style={{
        height: '100%', display: 'flex', alignItems: 'center', gap: 8,
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 24, flexShrink: 0 }}>
          <span style={{
            width: 34, height: 34,
            background: 'var(--primary)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>🎉</span>
          <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--primary)', letterSpacing: '-0.3px' }}>
            Vendor<span style={{ color: 'var(--text)' }}>Connect</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav style={{ display: 'flex', gap: 4, flex: 1, alignItems: 'center' }}>
          <NavLink href="/vendors">Find Vendors</NavLink>
          <NavLink href="/vendors?categorySlug=photography">Photographers</NavLink>
          <NavLink href="/vendors?categorySlug=venues">Venues</NavLink>
          <NavLink href="/vendors?categorySlug=catering">Catering</NavLink>
          <NavLink href="/about">About</NavLink>
        </nav>

        {/* Auth area */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          {user ? (
            <>
              <Link href={dashboardHref} style={{
                padding: '7px 16px',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                fontSize: 14, fontWeight: 500,
                color: 'var(--text)',
              }}>
                {isStaff ? 'Dashboard' : 'Browse vendors'}
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  padding: '7px 16px',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 14, fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" style={{
                padding: '7px 16px',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                fontSize: 14, fontWeight: 500,
                color: 'var(--text)',
              }}>
                Sign in
              </Link>
              <Link href="/register?role=VENDOR" className="btn-primary" style={{ padding: '8px 18px', fontSize: 14 }}>
                List your business
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="nav-link">
      {children}
    </Link>
  );
}
