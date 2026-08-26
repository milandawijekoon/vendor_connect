import type { ReviewDto } from '@vendorconnect/shared';

interface Props { reviews: ReviewDto[]; }

function StarRating({ rating }: { rating: number }) {
  return (
    <span aria-label={`${rating} out of 5 stars`} style={{ display: 'inline-flex', gap: 1 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ color: i < rating ? 'var(--star)' : '#D1D5DB', fontSize: 15 }}>★</span>
      ))}
    </span>
  );
}

function InitialAvatar({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase();
  const colors = ['#C8385E', '#7B2FF7', '#0EA5E9', '#F59E0B', '#10B981'];
  const color = colors[initial.charCodeAt(0) % colors.length]!;
  return (
    <div style={{
      width: 40, height: 40, borderRadius: '50%',
      background: color, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 16, fontWeight: 700, flexShrink: 0,
    }}>
      {initial}
    </div>
  );
}

export function ReviewList({ reviews }: Props) {
  if (reviews.length === 0) {
    return (
      <div style={{
        padding: '32px 24px', background: 'var(--surface)',
        border: '1.5px dashed var(--border)',
        borderRadius: 'var(--radius-lg)', textAlign: 'center',
      }}>
        <div style={{ fontSize: 32, marginBottom: 10 }}>⭐</div>
        <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>No reviews yet</p>
        <p style={{ fontSize: 14, color: 'var(--text-sec)' }}>Be the first to share your experience!</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {reviews.map((r) => (
        <div key={r.id} style={{
          padding: '18px 20px',
          background: 'var(--white)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <InitialAvatar name={r.reviewer.name} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{r.reviewer.name}</p>
                  <StarRating rating={r.rating} />
                </div>
                <time style={{ color: 'var(--text-muted)', fontSize: 12, flexShrink: 0 }}>
                  {new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </time>
              </div>
              {r.comment && (
                <p style={{ margin: 0, color: 'var(--text-sec)', lineHeight: 1.7, fontSize: 14 }}>{r.comment}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
