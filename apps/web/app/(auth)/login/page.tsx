import type { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from '../../../components/features/auth/LoginForm';

export const metadata: Metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'var(--surface)' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Card */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
          {/* Top accent */}
          <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', height: 6 }} />

          <div style={{ padding: '36px 36px 32px' }}>
            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ width: 36, height: 36, background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🎉</span>
                <span style={{ fontWeight: 800, fontSize: 20, color: 'var(--primary)' }}>
                  Vendor<span style={{ color: 'var(--text)' }}>Connect</span>
                </span>
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px', color: 'var(--text)' }}>Welcome back</h1>
              <p style={{ margin: 0, color: 'var(--text-sec)', fontSize: 14 }}>Sign in to your account</p>
            </div>

            <LoginForm />

            <div style={{ marginTop: 20, textAlign: 'center', paddingTop: 20, borderTop: '1px solid var(--border)' }}>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--text-sec)' }}>
                Don&apos;t have an account?{' '}
                <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
          <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>← Back to homepage</Link>
        </p>
      </div>
    </div>
  );
}
