import type { ReactNode } from 'react';

/**
 * Shared layout for static content pages (About, Contact, Privacy, Terms).
 * Renders a compact hero band followed by a readable prose column.
 */
export function ContentPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <>
      <section
        style={{
          background: 'linear-gradient(135deg,#0A1712 0%,#123423 60%,#1F6B4E 100%)',
          padding: '64px 20px 56px',
        }}
      >
        <div className="container" style={{ maxWidth: 820 }}>
          {eyebrow && (
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#8FD9B5',
                marginBottom: 14,
              }}
            >
              {eyebrow}
            </p>
          )}
          <h1 style={{ fontSize: 'clamp(30px,5vw,44px)', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.15 }}>
            {title}
          </h1>
          {intro && (
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.75)', marginTop: 16, lineHeight: 1.65 }}>
              {intro}
            </p>
          )}
        </div>
      </section>

      <section style={{ padding: '56px 20px 24px' }}>
        <div className="container prose" style={{ maxWidth: 820 }}>
          {children}
        </div>
      </section>
    </>
  );
}
