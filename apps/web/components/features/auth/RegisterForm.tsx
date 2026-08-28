'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../lib/auth/context';
import { registerSchema } from '../../../lib/validation/auth';
import { ApiClientError } from '../../../lib/api/client';
import { Icon, type IconName } from '../../ui/icons';
import { Button, Field, Input } from '../../ui/primitives';
import { GoogleSignInButton } from './GoogleSignInButton';
import { AuthDivider } from './AuthDivider';

const ROLE_OPTIONS: { value: 'CUSTOMER' | 'VENDOR'; icon: IconName; label: string; sub: string }[] = [
  { value: 'CUSTOMER', icon: 'user', label: "I'm a customer", sub: 'Planning an event' },
  { value: 'VENDOR', icon: 'building', label: "I'm a vendor", sub: 'List my business' },
];

export function RegisterForm() {
  const { register } = useAuth();
  const [role, setRole] = useState<'CUSTOMER' | 'VENDOR'>('CUSTOMER');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError('');
    const formData = new FormData(e.currentTarget);
    const raw = {
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      role,
      phone: formData.get('phone') || undefined,
    };
    const result = registerSchema.safeParse(raw);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[String(issue.path[0])] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    try {
      setIsSubmitting(true);
      await register(result.data);
    } catch (err) {
      setServerError(err instanceof ApiClientError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
    <form onSubmit={(e) => void handleSubmit(e)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {serverError && (
        <p className="callout callout--danger">
          <Icon name="alert-triangle" size={16} />
          {serverError}
        </p>
      )}

      <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
        <legend className="label" style={{ marginBottom: 8 }}>
          I want to…
        </legend>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {ROLE_OPTIONS.map((opt) => {
            const active = role === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRole(opt.value)}
                aria-pressed={active}
                style={{
                  padding: '14px 12px',
                  textAlign: 'center',
                  border: `1.5px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                  background: active ? 'var(--primary-bg)' : 'var(--white)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    color: active ? 'var(--primary)' : 'var(--text-muted)',
                    marginBottom: 6,
                  }}
                >
                  <Icon name={opt.icon} size={22} />
                </span>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{opt.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-sec)', marginTop: 2 }}>{opt.sub}</div>
              </button>
            );
          })}
        </div>
      </fieldset>

      <Field label="Full name" htmlFor="reg-name" required error={errors['name']}>
        <Input id="reg-name" name="name" type="text" autoComplete="name" required invalid={!!errors['name']} />
      </Field>

      <Field label="Email address" htmlFor="reg-email" required error={errors['email']}>
        <Input id="reg-email" name="email" type="email" autoComplete="email" required invalid={!!errors['email']} />
      </Field>

      <Field label="Password" htmlFor="reg-password" required error={errors['password']} hint="At least 8 characters">
        <Input
          id="reg-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          invalid={!!errors['password']}
        />
      </Field>

      <Field label="Phone" htmlFor="reg-phone" hint="Optional">
        <Input id="reg-phone" name="phone" type="tel" autoComplete="tel" placeholder="+94 77 000 0000" />
      </Field>

      <Button type="submit" block loading={isSubmitting} iconRight="arrow-right">
        Create account
      </Button>

      <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
        By creating an account you agree to our{' '}
        <Link href="/terms" style={{ color: 'var(--primary)' }}>
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" style={{ color: 'var(--primary)' }}>
          Privacy Policy
        </Link>
        .
      </p>
    </form>

    <AuthDivider />
    <GoogleSignInButton role={role} text="signup_with" />
    </>
  );
}
