'use client';

import { useState } from 'react';
import { useAuth } from '../../../lib/auth/context';
import { loginSchema, type LoginFormValues } from '../../../lib/validation/auth';
import { ApiClientError } from '../../../lib/api/client';

const inputStyle: React.CSSProperties = {
  display: 'block', width: '100%', marginTop: 6,
  padding: '11px 14px', border: '1.5px solid var(--border)',
  borderRadius: 'var(--radius-sm)', fontSize: 14,
  color: 'var(--text)', background: 'var(--white)',
  outline: 'none', transition: 'border-color 0.15s',
};
const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: 'var(--text)' };

export function LoginForm() {
  const { login } = useAuth();
  const [errors, setErrors] = useState<Partial<LoginFormValues>>({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError('');
    const formData = new FormData(e.currentTarget);
    const raw = { email: formData.get('email'), password: formData.get('password') };

    const result = loginSchema.safeParse(raw);
    if (!result.success) {
      const fieldErrors: Partial<LoginFormValues> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as keyof LoginFormValues] = issue.message;
      });
      setErrors(fieldErrors); return;
    }
    setErrors({});
    try {
      setIsSubmitting(true);
      await login(result.data);
    } catch (err) {
      setServerError(err instanceof ApiClientError ? err.message : 'Something went wrong. Please try again.');
    } finally { setIsSubmitting(false); }
  }

  const focus = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = 'var(--primary)');
  const blur  = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = errors.email || errors.password ? '#DC2626' : 'var(--border)');

  return (
    <form onSubmit={(e) => void handleSubmit(e)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {serverError && (
        <div style={{ padding: '11px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-sm)', color: '#DC2626', fontSize: 14 }}>
          {serverError}
        </div>
      )}

      <div>
        <label style={labelStyle}>
          Email address
          <input name="email" type="email" autoComplete="email" required
            style={{ ...inputStyle, ...(errors.email ? { borderColor: '#DC2626' } : {}) }}
            onFocus={focus} onBlur={blur}
          />
        </label>
        {errors.email && <span style={{ color: '#DC2626', fontSize: 12, marginTop: 4, display: 'block' }}>{errors.email}</span>}
      </div>

      <div>
        <label style={labelStyle}>
          Password
          <input name="password" type="password" autoComplete="current-password" required
            style={{ ...inputStyle, ...(errors.password ? { borderColor: '#DC2626' } : {}) }}
            onFocus={focus} onBlur={blur}
          />
        </label>
        {errors.password && <span style={{ color: '#DC2626', fontSize: 12, marginTop: 4, display: 'block' }}>{errors.password}</span>}
      </div>

      <button type="submit" disabled={isSubmitting} style={{
        padding: '13px 0', background: isSubmitting ? 'var(--text-muted)' : 'var(--primary)',
        color: '#fff', border: 'none', borderRadius: 'var(--radius-md)',
        fontSize: 15, fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer',
        transition: 'background 0.18s',
      }}>
        {isSubmitting ? 'Signing in…' : 'Sign in →'}
      </button>
    </form>
  );
}
