'use client';

import { useState } from 'react';
import { useAuth } from '../../../lib/auth/context';
import { loginSchema, type LoginFormValues } from '../../../lib/validation/auth';
import { ApiClientError } from '../../../lib/api/client';
import { Icon } from '../../ui/icons';
import { Button, Field, Input } from '../../ui/primitives';
import { GoogleSignInButton } from './GoogleSignInButton';
import { AuthDivider } from './AuthDivider';

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
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    try {
      setIsSubmitting(true);
      await login(result.data);
    } catch (err) {
      setServerError(err instanceof ApiClientError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
    <form onSubmit={(e) => void handleSubmit(e)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {serverError && (
        <p className="callout callout--danger">
          <Icon name="alert-triangle" size={16} />
          {serverError}
        </p>
      )}

      <Field label="Email address" htmlFor="login-email" error={errors.email}>
        <Input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          invalid={!!errors.email}
        />
      </Field>

      <Field label="Password" htmlFor="login-password" error={errors.password}>
        <Input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          invalid={!!errors.password}
        />
      </Field>

      <Button type="submit" block loading={isSubmitting} iconRight="arrow-right">
        Sign in
      </Button>
    </form>

    <AuthDivider />
    <GoogleSignInButton text="signin_with" />
    </>
  );
}
