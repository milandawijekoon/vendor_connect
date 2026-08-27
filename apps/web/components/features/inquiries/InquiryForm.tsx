'use client';

import { useState } from 'react';
import { ApiClientError } from '../../../lib/api/client';
import { inquiriesApi } from '../../../lib/api/inquiries';
import { Icon } from '../../ui/icons';
import { Button, Field, Input, Textarea } from '../../ui/primitives';

interface Props {
  vendorSlug: string;
  vendorName: string;
}

export function InquiryForm({ vendorSlug, vendorName }: Props) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', eventDate: '', message: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await inquiriesApi.create(vendorSlug, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.message,
        ...(form.eventDate ? { eventDate: form.eventDate } : {}),
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        style={{
          padding: 28,
          background: 'var(--success-bg)',
          border: '1.5px solid var(--success-border)',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center',
        }}
      >
        <div style={{ color: 'var(--success)', display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <Icon name="check-circle" size={36} />
        </div>
        <p style={{ fontWeight: 700, fontSize: 17, color: 'var(--success)', marginBottom: 6 }}>Inquiry sent</p>
        <p style={{ color: 'var(--text-sec)', fontSize: 14, lineHeight: 1.6 }}>
          {vendorName} will get back to you soon. We&apos;ve emailed you a confirmation.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'var(--white)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div style={{ background: 'var(--primary)', padding: '18px 22px' }}>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#FFFFFF' }}>Contact {vendorName}</h2>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.82)' }}>
          Check availability &amp; get a quote
        </p>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Your name" htmlFor="inq-name" required>
            <Input id="inq-name" required value={form.name} onChange={set('name')} placeholder="Full name" />
          </Field>
          <Field label="Phone" htmlFor="inq-phone" required>
            <Input id="inq-phone" required value={form.phone} onChange={set('phone')} placeholder="+94 77 000 0000" />
          </Field>
        </div>

        <Field label="Email" htmlFor="inq-email" required>
          <Input id="inq-email" required type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
        </Field>

        <Field label="Event date" htmlFor="inq-date">
          <Input id="inq-date" type="date" value={form.eventDate} onChange={set('eventDate')} />
        </Field>

        <Field label="Message" htmlFor="inq-message" required hint="Minimum 20 characters">
          <Textarea
            id="inq-message"
            required
            minLength={20}
            rows={4}
            value={form.message}
            onChange={set('message')}
            placeholder="Tell the vendor about your event and what you're looking for…"
          />
        </Field>

        {error && (
          <p className="callout callout--danger">
            <Icon name="alert-triangle" size={16} />
            {error}
          </p>
        )}

        <Button type="submit" block loading={loading} iconRight="arrow-right">
          Send inquiry
        </Button>

        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
          No spam — vendors typically respond within 24 hours.
        </p>
      </form>
    </div>
  );
}
