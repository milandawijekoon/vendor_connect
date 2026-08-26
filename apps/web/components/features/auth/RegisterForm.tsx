'use client';

import { useState } from 'react';
import { useAuth } from '../../../lib/auth/context';
import { registerSchema } from '../../../lib/validation/auth';
import { ApiClientError } from '../../../lib/api/client';

const inputStyle: React.CSSProperties = {
  display: 'block', width: '100%', marginTop: 6,
  padding: '11px 14px', border: '1.5px solid var(--border)',
  borderRadius: 'var(--radius-sm)', fontSize: 14,
  color: 'var(--text)', background: 'var(--white)',
  outline: 'none', transition: 'border-color 0.15s',
};
const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: 'var(--text)' };

const focus = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = 'var(--primary)');
const blur  = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = 'var(--border)');

export function RegisterForm() {
  const { register } = useAuth();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError('');
    const formData = new FormData(e.currentTarget);
    const raw = {
      name: formData.get('name'), email: formData.get('email'),
      password: formData.get('password'), role: formData.get('role'),
      phone: formData.get('phone') || undefined,
    };
    const result = registerSchema.safeParse(raw);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => { fieldErrors[String(issue.path[0])] = issue.message; });
      setErrors(fieldErrors); return;
    }
    setErrors({});
    try {
      setIsSubmitting(true);
      await register(result.data);
    } catch (err) {
      setServerError(err instanceof ApiClientError ? err.message : 'Something went wrong. Please try again.');
    } finally { setIsSubmitting(false); }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {serverError && (
        <div style={{ padding: '11px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-sm)', color: '#DC2626', fontSize: 14 }}>
          {serverError}
        </div>
      )}

      {/* Role selector */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[
          { value: 'COUPLE', icon: '💑', label: 'I\'m a Couple', sub: 'Looking for vendors' },
          { value: 'VENDOR', icon: '🏢', label: 'I\'m a Vendor', sub: 'List my business' },
        ].map((opt) => (
          <label key={opt.value} style={{ cursor: 'pointer' }}>
            <input type="radio" name="role" value={opt.value} defaultChecked={opt.value === 'COUPLE'} style={{ display: 'none' }} />
            <div style={{
              padding: '14px 12px', textAlign: 'center',
              border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)',
              transition: 'all 0.15s', cursor: 'pointer',
            }}
            onClick={(e) => {
              const siblings = (e.currentTarget.closest('form') as HTMLFormElement).querySelectorAll('[data-role-card]');
              siblings.forEach((s) => {
                (s as HTMLElement).style.borderColor = 'var(--border)';
                (s as HTMLElement).style.background = 'var(--white)';
              });
              const target = e.currentTarget as HTMLElement;
              target.style.borderColor = 'var(--primary)';
              target.style.background = 'var(--primary-bg)';
            }}
            data-role-card>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{opt.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{opt.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-sec)', marginTop: 2 }}>{opt.sub}</div>
            </div>
          </label>
        ))}
      </div>

      <div>
        <label style={labelStyle}>
          Full Name
          <input name="name" type="text" autoComplete="name" required
            style={{ ...inputStyle, ...(errors['name'] ? { borderColor: '#DC2626' } : {}) }}
            onFocus={focus} onBlur={blur}
          />
        </label>
        {errors['name'] && <span style={{ color: '#DC2626', fontSize: 12, marginTop: 4, display: 'block' }}>{errors['name']}</span>}
      </div>

      <div>
        <label style={labelStyle}>
          Email Address
          <input name="email" type="email" autoComplete="email" required
            style={{ ...inputStyle, ...(errors['email'] ? { borderColor: '#DC2626' } : {}) }}
            onFocus={focus} onBlur={blur}
          />
        </label>
        {errors['email'] && <span style={{ color: '#DC2626', fontSize: 12, marginTop: 4, display: 'block' }}>{errors['email']}</span>}
      </div>

      <div>
        <label style={labelStyle}>
          Password
          <input name="password" type="password" autoComplete="new-password" required
            style={{ ...inputStyle, ...(errors['password'] ? { borderColor: '#DC2626' } : {}) }}
            onFocus={focus} onBlur={blur}
          />
        </label>
        {errors['password'] && <span style={{ color: '#DC2626', fontSize: 12, marginTop: 4, display: 'block' }}>{errors['password']}</span>}
      </div>

      <div>
        <label style={labelStyle}>
          Phone (optional)
          <input name="phone" type="tel" autoComplete="tel"
            style={inputStyle} onFocus={focus} onBlur={blur}
            placeholder="+94 77 000 0000"
          />
        </label>
      </div>

      <button type="submit" disabled={isSubmitting} style={{
        padding: '13px 0', background: isSubmitting ? 'var(--text-muted)' : 'var(--primary)',
        color: '#fff', border: 'none', borderRadius: 'var(--radius-md)',
        fontSize: 15, fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer',
        transition: 'background 0.18s',
      }}>
        {isSubmitting ? 'Creating account…' : 'Create Account →'}
      </button>

      <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
        By creating an account you agree to our{' '}
        <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Terms of Service</a>
        {' '}and{' '}
        <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Privacy Policy</a>.
      </p>
    </form>
  );
}
