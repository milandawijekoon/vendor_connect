'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Role } from '@vendorconnect/shared';
import { useAuth } from '../../lib/auth/context';
import { Icon, type IconName } from './icons';
import { LoadingBlock } from './primitives';

interface NavItem {
  label: string;
  href: string;
  icon: IconName;
  exact?: boolean;
}

const VENDOR_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/vendor', icon: 'layout-dashboard', exact: true },
  { label: 'Inquiries', href: '/dashboard/vendor/inquiries', icon: 'inbox' },
  { label: 'Business profile', href: '/dashboard/vendor/profile', icon: 'building' },
];

const ADMIN_NAV: NavItem[] = [
  { label: 'Overview', href: '/dashboard/admin', icon: 'layout-dashboard', exact: true },
  { label: 'Vendor queue', href: '/dashboard/admin/vendors', icon: 'shield-check' },
];

export function DashboardShell({
  children,
  requireRole,
}: {
  children: ReactNode;
  requireRole?: Role | undefined;
}) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <div className="dash-shell" style={{ gridTemplateColumns: '1fr' }}>
        <LoadingBlock />
      </div>
    );
  }

  if (!user || (requireRole && user.role !== requireRole)) {
    return (
      <div className="dash-shell" style={{ gridTemplateColumns: '1fr' }}>
        <div className="empty-state">
          <div className="empty-state__icon">
            <Icon name="shield-check" size={22} />
          </div>
          <h3>Sign in required</h3>
          <p>You need to be signed in with the right account to view this page.</p>
          <Link href="/login" className="btn btn--primary btn--sm">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const nav = user.role === Role.ADMIN ? ADMIN_NAV : VENDOR_NAV;
  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <div className="dash-shell">
      <aside className="dash-sidebar">
        <div className="dash-sidebar__group">{user.role === Role.ADMIN ? 'Admin' : 'Vendor'}</div>
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`dash-nav-link ${isActive(item) ? 'dash-nav-link--active' : ''}`}
            aria-current={isActive(item) ? 'page' : undefined}
          >
            <Icon name={item.icon} size={17} />
            {item.label}
          </Link>
        ))}
      </aside>

      <div style={{ minWidth: 0 }}>{children}</div>
    </div>
  );
}
