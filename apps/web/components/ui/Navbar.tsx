'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/auth/context';
import { useCategories } from '../../lib/hooks/useCategories';
import { Role } from '@vendorconnect/shared';
import { Logo } from './Logo';
import { Icon } from './icons';
import { Button, ButtonLink, Input } from './primitives';
import { GoldPriceBadge } from './GoldPriceBadge';

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const categories = useCategories();

  const [catOpen, setCatOpen] = useState(false);
  const [catQuery, setCatQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCatOpen(false);
    setCatQuery('');
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = () => {
    logout();
  };

  const isStaff = user?.role === Role.ADMIN || user?.role === Role.VENDOR;
  const dashboardHref =
    user?.role === Role.ADMIN
      ? '/dashboard/admin'
      : user?.role === Role.VENDOR
        ? '/dashboard/vendor'
        : '/vendors';

  const filteredCategories = catQuery.trim()
    ? categories.filter((c) => c.name.toLowerCase().includes(catQuery.trim().toLowerCase()))
    : categories;

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: 'var(--nav-h)',
        background: 'var(--white)',
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 1px 8px rgba(0,0,0,0.05)',
      }}
    >
      <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link href="/" aria-label="VendorsLK home" style={{ marginRight: 20, flexShrink: 0 }}>
          <Logo size={30} />
        </Link>

        {/* Desktop nav */}
        <nav className="nav-desktop" style={{ display: 'flex', gap: 2, flex: 1, alignItems: 'center' }}>
          <Link href="/vendors" className="nav-link">
            Find Vendors
          </Link>

          <div ref={catRef} style={{ position: 'relative' }}>
            <button
              className="nav-link"
              onClick={() => setCatOpen((o) => !o)}
              aria-expanded={catOpen}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Categories
              <Icon name="chevron-down" size={14} style={{ transform: catOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
            </button>
            {catOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  width: 260,
                  background: 'var(--white)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <Input
                  autoFocus
                  icon="search"
                  placeholder="Search categories…"
                  value={catQuery}
                  onChange={(e) => setCatQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div style={{ maxHeight: 280, overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((c) => (
                      <Link
                        key={c.id}
                        href={`/vendors?categorySlug=${c.slug}`}
                        className="nav-link"
                        style={{ display: 'block', padding: '8px 10px' }}
                      >
                        {c.name}
                      </Link>
                    ))
                  ) : (
                    <span style={{ padding: '8px 10px', fontSize: 13, color: 'var(--text-sec)' }}>No categories found</span>
                  )}
                </div>
              </div>
            )}
          </div>

          <Link href="/about" className="nav-link">
            About
          </Link>
          <Link href="/contact" className="nav-link">
            Contact
          </Link>
        </nav>

        {/* Auth area (desktop) */}
        <div className="nav-desktop" style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          <GoldPriceBadge />
          <span style={{ width: 1, alignSelf: 'stretch', background: 'var(--border)', margin: '8px 2px' }} />
          {user ? (
            <>
              <ButtonLink href={dashboardHref} variant="ghost" size="sm" iconLeft={isStaff ? 'layout-dashboard' : 'search'}>
                {isStaff ? 'Dashboard' : 'Browse'}
              </ButtonLink>
              <Button variant="outline" size="sm" iconLeft="log-out" onClick={handleLogout}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <ButtonLink href="/login" variant="ghost" size="sm">
                Sign in
              </ButtonLink>
              <ButtonLink href="/register?role=VENDOR" variant="primary" size="sm">
                List your business
              </ButtonLink>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="nav-mobile-toggle"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((o) => !o)}
          style={{
            display: 'none',
            marginLeft: 'auto',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text)',
            padding: 6,
          }}
        >
          <Icon name={mobileOpen ? 'x' : 'menu'} size={24} />
        </button>
      </div>

      {/* Mobile sheet */}
      {mobileOpen && (
        <div
          className="nav-mobile-sheet"
          style={{
            background: 'var(--white)',
            borderBottom: '1px solid var(--border)',
            boxShadow: 'var(--shadow-md)',
            padding: '12px 20px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <div style={{ padding: '4px 0 8px' }}>
            <GoldPriceBadge variant="row" />
          </div>
          <Link href="/vendors" className="nav-link" style={{ padding: '10px 8px' }}>
            Find Vendors
          </Link>
          <div style={{ padding: '4px 8px 8px' }}>
            <Input
              icon="search"
              placeholder="Search categories…"
              value={catQuery}
              onChange={(e) => setCatQuery(e.target.value)}
            />
          </div>
          <div style={{ maxHeight: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filteredCategories.length > 0 ? (
              filteredCategories.map((c) => (
                <Link
                  key={c.id}
                  href={`/vendors?categorySlug=${c.slug}`}
                  className="nav-link"
                  style={{ padding: '10px 8px', paddingLeft: 20, fontSize: 13 }}
                >
                  {c.name}
                </Link>
              ))
            ) : (
              <span style={{ padding: '10px 20px', fontSize: 13, color: 'var(--text-sec)' }}>No categories found</span>
            )}
          </div>
          <Link href="/about" className="nav-link" style={{ padding: '10px 8px' }}>
            About
          </Link>
          <Link href="/contact" className="nav-link" style={{ padding: '10px 8px' }}>
            Contact
          </Link>
          <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />
          {user ? (
            <>
              <ButtonLink href={dashboardHref} variant="outline" block iconLeft={isStaff ? 'layout-dashboard' : 'search'}>
                {isStaff ? 'Dashboard' : 'Browse vendors'}
              </ButtonLink>
              <Button variant="ghost" block iconLeft="log-out" onClick={handleLogout}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <ButtonLink href="/login" variant="ghost" block>
                Sign in
              </ButtonLink>
              <ButtonLink href="/register?role=VENDOR" variant="primary" block>
                List your business
              </ButtonLink>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 820px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-toggle { display: inline-flex !important; }
        }
      `}</style>
    </header>
  );
}
