import type { Metadata } from 'next';
import { ContentPage } from '../../components/ui/ContentPage';
import { Icon, type IconName } from '../../components/ui/icons';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with the VendorConnect team — support for customers and vendors across Sri Lanka.',
};

const CHANNELS: { icon: IconName; label: string; value: string; href: string }[] = [
  {
    icon: 'mail',
    label: 'General & support',
    value: 'hello@vendorconnect.lk',
    href: 'mailto:hello@vendorconnect.lk',
  },
  {
    icon: 'building',
    label: 'Vendor onboarding',
    value: 'vendors@vendorconnect.lk',
    href: 'mailto:vendors@vendorconnect.lk',
  },
  {
    icon: 'phone',
    label: 'Phone (Mon–Fri, 9am–6pm)',
    value: '+94 11 234 5678',
    href: 'tel:+94112345678',
  },
];

export default function ContactPage() {
  return (
    <ContentPage
      eyebrow="Contact"
      title="We’d love to hear from you"
      intro="Whether you’re planning an event, listing your business, or just have a question — reach out and we’ll get back to you within one business day."
    >
      <h2>Contact channels</h2>
      <div style={{ display: 'grid', gap: 14, marginBottom: 32 }}>
        {CHANNELS.map((c) => (
          <div
            key={c.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '18px 20px',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--white)',
            }}
          >
            <span
              style={{
                width: 42,
                height: 42,
                flexShrink: 0,
                borderRadius: 'var(--radius-md)',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name={c.icon} size={20} />
            </span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-sec)' }}>{c.label}</div>
              <a href={c.href} style={{ fontSize: 16, fontWeight: 600, color: 'var(--primary)' }}>
                {c.value}
              </a>
            </div>
          </div>
        ))}
      </div>

      <h2>Office</h2>
      <p>
        VendorConnect (Pvt) Ltd
        <br />
        Level 3, 123 Union Place
        <br />
        Colombo 00200, Sri Lanka
      </p>

      <h2>For vendors</h2>
      <p>
        Already have a listing? Sign in to your{' '}
        <a href="/dashboard/vendor">vendor dashboard</a> to manage inquiries and update your profile. New here?{' '}
        <a href="/register?role=VENDOR">List your business</a> — it’s free.
      </p>
    </ContentPage>
  );
}
