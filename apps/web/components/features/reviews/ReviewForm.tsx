'use client';

import { useState } from 'react';
import { useAuth } from '../../../lib/auth/context';
import { ApiClientError } from '../../../lib/api/client';
import { reviewsApi } from '../../../lib/api/reviews';
import { Role, type ReviewDto } from '@vendorconnect/shared';

interface Props { vendorSlug: string; onReviewSubmitted: (review: ReviewDto) => void; }

export function ReviewForm({ vendorSlug, onReviewSubmitted }: Props) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!user) {
    return (
      <div style={{
        padding: '20px 22px', background: 'var(--primary-bg)',
        border: '1.5px solid var(--primary-light)', borderRadius: 'var(--radius-lg)',
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <span style={{ fontSize: 28 }}>⭐</span>
        <div>
          <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: 15 }}>Share your experience</p>
          <p style={{ margin: 0, color: 'var(--text-sec)', fontSize: 14 }}>
            <a href="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Sign in</a>
            {' '}to leave a review.
          </p>
        </div>
      </div>
    );
  }

  if (user.role !== Role.CUSTOMER) return null;

  if (done) {
    return (
      <div style={{ padding: '20px 22px', background: '#F0FDF4', border: '1.5px solid #86EFAC', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
        <p style={{ margin: 0, fontWeight: 700, color: '#14532D', fontSize: 16 }}>Thank you for your review! 🎉</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setError('Please select a star rating.'); return; }
    setError(null); setLoading(true);
    try {
      const review = await reviewsApi.create(vendorSlug, { rating, ...(comment ? { comment } : {}) });
      onReviewSubmitted(review);
      setDone(true);
    } catch (err) {
      if (err instanceof ApiClientError && err.statusCode === 409) {
        setError('You have already reviewed this vendor.');
      } else {
        setError(err instanceof ApiClientError ? err.message : 'Something went wrong.');
      }
    } finally { setLoading(false); }
  };

  return (
    <div style={{ background: 'var(--white)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '22px 22px' }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 700 }}>Write a Review</h3>

      <form onSubmit={(e) => void handleSubmit(e)}>
        {/* Star picker */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: 'var(--text-sec)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Your Rating *
          </p>
          <div style={{ display: 'flex', gap: 4 }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} type="button"
                onClick={() => setRating(s)}
                onMouseEnter={() => setHovered(s)}
                onMouseLeave={() => setHovered(0)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 36, padding: '0 2px', lineHeight: 1,
                  color: s <= (hovered || rating) ? 'var(--star)' : '#D1D5DB',
                  transition: 'color 0.12s, transform 0.12s',
                  transform: s <= (hovered || rating) ? 'scale(1.1)' : 'scale(1)',
                }}
                aria-label={`${s} star${s > 1 ? 's' : ''}`}
              >★</button>
            ))}
          </div>
          {rating > 0 && (
            <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>
              {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
            </p>
          )}
        </div>

        {/* Comment */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-sec)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
            Your Review (optional)
          </label>
          <textarea
            rows={3} value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share details about your experience…"
            style={{
              width: '100%', padding: '11px 14px',
              border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)',
              fontSize: 14, color: 'var(--text)',
              background: 'transparent', resize: 'vertical', outline: 'none',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>

        {error && (
          <p style={{ margin: '0 0 12px', padding: '9px 12px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-sm)', color: '#DC2626', fontSize: 13 }}>
            {error}
          </p>
        )}

        <button
          type="submit" disabled={loading}
          style={{
            padding: '11px 28px', background: loading ? 'var(--text-muted)' : 'var(--primary)',
            color: '#fff', border: 'none', borderRadius: 'var(--radius-md)',
            fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.18s',
          }}
        >
          {loading ? 'Submitting…' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}
