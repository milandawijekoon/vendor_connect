import type { VendorProfileDto } from '@vendorconnect/shared';
import { Icon } from '../../ui/icons';
import { Stars } from '../../ui/primitives';

/* ── Brand marks (inline, multi-colour — kept out of the stroke-only Icon set) ── */

function FacebookMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#1877F2"
        d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z"
      />
    </svg>
  );
}

function GoogleMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.52 12.27c0-.82-.07-1.6-.2-2.36H12v4.48h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.75Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.08 7.95-2.91l-3.88-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.28v3.09A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.27 14.29a7.21 7.21 0 0 1 0-4.58V6.62H1.28a12 12 0 0 0 0 10.76l3.99-3.09Z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.62l3.99 3.09C6.22 6.86 8.87 4.75 12 4.75Z" />
    </svg>
  );
}

/* ── Component ────────────────────────────────────────────────────────────── */

interface Props {
  vendor: Pick<
    VendorProfileDto,
    'businessName' | 'facebookUrl' | 'googleUrl' | 'googleRating' | 'googleReviewCount' | 'googleReviews'
  >;
}

const linkBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 9,
  padding: '9px 15px',
  borderRadius: 'var(--radius-full)',
  border: '1px solid var(--border)',
  background: 'var(--white)',
  color: 'var(--text)',
  fontSize: 14,
  fontWeight: 600,
  textDecoration: 'none',
  boxShadow: 'var(--shadow-sm)',
};

export function VendorOnlinePresence({ vendor }: Props) {
  const { facebookUrl, googleUrl, googleRating, googleReviewCount, googleReviews } = vendor;
  const hasLinks = Boolean(facebookUrl || googleUrl);
  const hasGoogleReviews = googleReviews.length > 0 || googleRating != null;

  if (!hasLinks && !hasGoogleReviews) return null;

  return (
    <section style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 14, color: 'var(--text)' }}>
        {vendor.businessName} online
      </h2>

      {hasLinks && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: hasGoogleReviews ? 20 : 0 }}>
          {facebookUrl && (
            <a href={facebookUrl} target="_blank" rel="noopener noreferrer" style={linkBtn}>
              <FacebookMark /> Facebook page
              <Icon name="external-link" size={13} style={{ color: 'var(--text-muted)' }} />
            </a>
          )}
          {googleUrl && (
            <a href={googleUrl} target="_blank" rel="noopener noreferrer" style={linkBtn}>
              <GoogleMark /> Google listing
              <Icon name="external-link" size={13} style={{ color: 'var(--text-muted)' }} />
            </a>
          )}
        </div>
      )}

      {hasGoogleReviews && (
        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--white)',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              padding: '16px 20px',
              borderBottom: googleReviews.length > 0 ? '1px solid var(--border)' : 'none',
              background: 'var(--surface)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <GoogleMark size={22} />
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>Google reviews</p>
                {googleRating != null && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                    <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)' }}>
                      {googleRating.toFixed(1)}
                    </span>
                    <Stars rating={googleRating} size={14} />
                    {googleReviewCount != null && (
                      <span style={{ fontSize: 13, color: 'var(--text-sec)' }}>
                        ({googleReviewCount.toLocaleString()})
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            {googleUrl && (
              <a
                href={googleUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--primary)',
                  textDecoration: 'none',
                }}
              >
                See all on Google <Icon name="external-link" size={13} />
              </a>
            )}
          </div>

          {/* Review items */}
          {googleReviews.length > 0 && (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {googleReviews.slice(0, 3).map((r, i) => (
                <li
                  key={r.id}
                  style={{
                    padding: '16px 20px',
                    borderTop: i === 0 ? 'none' : '1px solid var(--border)',
                  }}
                >
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    {r.authorPhotoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.authorPhotoUrl}
                        alt=""
                        style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          flexShrink: 0,
                          background: 'var(--primary-light)',
                          color: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                        }}
                      >
                        {r.authorName.charAt(0)}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{r.authorName}</p>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.relativeTime}</span>
                      </div>
                      <Stars rating={r.rating} size={13} />
                      <p style={{ margin: '6px 0 0', color: 'var(--text-sec)', lineHeight: 1.65, fontSize: 14 }}>
                        {r.text}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
