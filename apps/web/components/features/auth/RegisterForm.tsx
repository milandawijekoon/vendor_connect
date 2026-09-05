'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../lib/auth/context';
import { registerSchema } from '../../../lib/validation/auth';
import { ApiClientError } from '../../../lib/api/client';
import { Icon } from '../../ui/icons';
import { Button, Field, Input } from '../../ui/primitives';
import { GoogleSignInButton } from './GoogleSignInButton';
import { AuthDivider } from './AuthDivider';

export function RegisterForm() {
  const { register } = useAuth();
  const role: 'CUSTOMER' | 'VENDOR' = 'VENDOR';
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [termsError, setTermsError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError('');
    setTermsError('');
    if (!agreedToTerms) {
      setTermsError('You must agree to the Terms of Service and Privacy Policy to create an account.');
      return;
    }
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

      <div>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => {
              setAgreedToTerms(e.target.checked);
              if (e.target.checked) setTermsError('');
            }}
            style={{ marginTop: 2 }}
            aria-invalid={!!termsError}
          />
          <span style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            I agree to the{' '}
            <Link href="/terms" style={{ color: 'var(--primary)' }}>
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" style={{ color: 'var(--primary)' }}>
              Privacy Policy
            </Link>
            . <span className="req">*</span>
          </span>
        </label>
        {termsError && (
          <p className="field-error" style={{ marginTop: 6 }}>
            {termsError}
          </p>
        )}
      </div>

      <Button type="submit" block loading={isSubmitting} iconRight="arrow-right" disabled={!agreedToTerms}>
        Create account
      </Button>
    </form>

    <AuthDivider />
    <GoogleSignInButton role={role} text="signup_with" disabled={!agreedToTerms} />
    </>
  );
}
