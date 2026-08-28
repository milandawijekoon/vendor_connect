'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../lib/auth/context';
import { ApiClientError } from '../../../lib/api/client';
import { Icon } from '../../ui/icons';

const GSI_SRC = 'https://accounts.google.com/gsi/client';
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

interface GoogleCredentialResponse {
  credential?: string;
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
  }) => void;
  renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } };
  }
}

let gsiPromise: Promise<void> | null = null;

function loadGsiScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.google?.accounts?.id) return Promise.resolve();
  if (gsiPromise) return gsiPromise;

  gsiPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('gsi load failed')));
      return;
    }
    const script = document.createElement('script');
    script.src = GSI_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('gsi load failed'));
    document.head.appendChild(script);
  });
  return gsiPromise;
}

interface Props {
  /** Role to request when this Google account signs in for the first time. */
  role?: 'CUSTOMER' | 'VENDOR';
  /** Google button copy: 'signin_with' (default) or 'signup_with'. */
  text?: 'signin_with' | 'signup_with' | 'continue_with';
}

export function GoogleSignInButton({ role, text = 'signin_with' }: Props) {
  const { loginWithGoogle } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!CLIENT_ID) {
      setError('Google sign-in is not configured.');
      return;
    }

    let cancelled = false;

    loadGsiScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.google) return;

        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          cancel_on_tap_outside: true,
          callback: (response) => {
            if (!response.credential) {
              setError('No credential returned by Google. Please try again.');
              return;
            }
            setPending(true);
            setError('');
            loginWithGoogle(response.credential, role)
              .catch((err: unknown) => {
                setError(
                  err instanceof ApiClientError
                    ? err.message
                    : 'Google sign-in failed. Please try again.',
                );
              })
              .finally(() => setPending(false));
          },
        });

        containerRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(containerRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text,
          shape: 'rectangular',
          logo_alignment: 'center',
          width: 360,
        });
      })
      .catch(() => {
        if (!cancelled) setError('Could not load Google sign-in.');
      });

    return () => {
      cancelled = true;
    };
  }, [loginWithGoogle, role, text]);

  return (
    <div>
      <div
        ref={containerRef}
        style={{
          display: 'flex',
          justifyContent: 'center',
          minHeight: 44,
          opacity: pending ? 0.5 : 1,
          pointerEvents: pending ? 'none' : 'auto',
        }}
      />
      {error && (
        <p className="callout callout--danger" style={{ marginTop: 12 }}>
          <Icon name="alert-triangle" size={16} />
          {error}
        </p>
      )}
    </div>
  );
}
