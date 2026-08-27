'use client';

import { useState } from 'react';
import { ApiClientError } from '../../../lib/api/client';
import { inquiriesApi } from '../../../lib/api/inquiries';

interface Props { vendorSlug: string; vendorName: string; }

const field: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4 };
const label: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.04em' };
const input: React.CSSProperties = {
  padding: '11px 14px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)',
  fontSize: 14, color: 'var(--text)', background: 'var(--white)', outline: 'none',
  transition: 'border-color 0.15s', width: '100%',
};

function Field({ label: l, children }: { label: string; children: React.ReactNode }) {
  return <div style={field}><label style={label}>{l}</label>{children}</div>;
}

export function InquiryForm({ vendorSlug, vendorName }: Props) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', eventDate: '', message: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    (e.target.style.borderColor = 'var(--primary)');
  const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    (e.target.style.borderColor = 'var(--border)');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await inquiriesApi.create(vendorSlug, {
        name: form.name, email: form.email, phone: form.phone, message: form.message,
        ...(form.eventDate ? { eventDate: form.eventDate } : {}),
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  if (success) {
    return (
      <div style={{
        padding: 28, background: '#F0FDF4', border: '1.5px solid #86EFAC',
        borderRadius: 'var(--radius-lg)', textAlign: 'center',
      }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
        <p style={{ fontWeight: 700, fontSize: 17, color: '#14532D', marginBottom: 6 }}>Inquiry sent!</p>
        <p style={{ color: '#16A34A', fontSize: 14, lineHeight: 1.6 }}>
          {vendorName} will get back to you soon. Check your email for confirmation.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--white)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', overflow: 'hidden',
      boxShadow: 'var(--shadow-md)',
    }}>
      {/* Card header */}
      <div style={{ background: 'var(--primary)', padding: '18px 22px' }}>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#FFFFFF' }}>
          Contact {vendorName}
        </h2>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
          Check availability &amp; get a quote
        </p>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Your Name *">
            <input required value={form.name} onChange={set('name')} placeholder="Full name" style={input} onFocus={focusStyle} onBlur={blurStyle} />
          </Field>
          <Field label="Phone *">
            <input required value={form.phone} onChange={set('phone')} placeholder="+94 77 000 0000" style={input} onFocus={focusStyle} onBlur={blurStyle} />
          </Field>
        </div>

        <Field label="Email *">
          <input required type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" style={input} onFocus={focusStyle} onBlur={blurStyle} />
        </Field>

        <Field label="Event Date">
          <input type="date" value={form.eventDate} onChange={set('eventDate')} style={input} onFocus={focusStyle} onBlur={blurStyle} />
        </Field>

        <Field label="Message * (min 20 characters)">
          <textarea
            required minLength={20} rows={4} value={form.message} onChange={set('message')}
            placeholder="Tell us about your event, what you're looking for…"
            style={{ ...input, resize: 'vertical' }}
            onFocus={focusStyle} onBlur={blurStyle}
          />
        </Field>

        {error && (
          <p style={{ margin: 0, padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-sm)', color: '#DC2626', fontSize: 13 }}>
            {error}
          </p>
        )}

        <button
          type="submit" disabled={loading}
          style={{
            padding: '13px 0',
            background: loading ? 'var(--text-muted)' : 'var(--primary)',
            color: '#FFFFFF', border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.18s',
          }}
        >
          {loading ? 'Sending…' : 'Send Inquiry →'}
        </button>

        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
          No spam — vendors respond within 24 hours.
        </p>
      </form>
    </div>
  );
}
