import type { Metadata } from 'next';
import Link from 'next/link';
import { RegisterForm } from '../../../components/features/auth/RegisterForm';
import { Logo } from '../../../components/ui/Logo';

export const metadata: Metadata = { title: 'List your business' };

export default function RegisterPage() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'var(--surface)' }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', height: 6 }} />

          <div style={{ padding: '36px 36px 32px' }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <Link href="/" aria-label="VendorsLK home" style={{ display: 'inline-flex', marginBottom: 14 }}>
                <Logo size={28} />
              </Link>
              <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px', color: 'var(--text)' }}>List your business</h1>
              <p style={{ margin: 0, color: 'var(--text-sec)', fontSize: 14 }}>Create a vendor account on VendorsLK</p>
            </div>

            <RegisterForm />

            <div style={{ marginTop: 20, textAlign: 'center', paddingTop: 20, borderTop: '1px solid var(--border)' }}>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--text-sec)' }}>
                Already have an account?{' '}
                <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
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
