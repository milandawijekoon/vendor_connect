'use client';

import { useState } from 'react';
import { useAuth } from '../../../lib/auth/context';
import { ApiClientError } from '../../../lib/api/client';
import { reviewsApi } from '../../../lib/api/reviews';
import { Role, type ReviewDto } from '@vendorconnect/shared';
import { Icon } from '../../ui/icons';
import { Button, Callout } from '../../ui/primitives';

interface Props {
  vendorSlug: string;
  onReviewSubmitted: (review: ReviewDto) => void;
}

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

export function ReviewForm({ vendorSlug, onReviewSubmitted }: Props) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!user) return null;

  if (user.role !== Role.CUSTOMER) return null;

  if (done) {
    return (
      <Callout tone="success" icon="check-circle">
        Thank you — your review has been published.
      </Callout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    setError(null);
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const shown = hovered || rating;

  return (
    <div
      style={{
        background: 'var(--white)',
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: 22,
      }}
    >
      <h3 style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 700 }}>Write a review</h3>

      <form onSubmit={(e) => void handleSubmit(e)}>
        <div style={{ marginBottom: 16 }}>
          <p className="label" style={{ marginBottom: 8 }}>
            Your rating <span className="req">*</span>
          </p>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setRating(s)}
                onMouseEnter={() => setHovered(s)}
                onMouseLeave={() => setHovered(0)}
                aria-label={`${s} star${s > 1 ? 's' : ''}`}
                aria-pressed={rating === s}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 2,
                  color: 'var(--star)',
                  display: 'inline-flex',
                  transition: 'transform 0.12s',
                  transform: s <= shown ? 'scale(1.08)' : 'scale(1)',
                }}
              >
                <Icon name={s <= shown ? 'star-filled' : 'star'} size={30} strokeWidth={1.5} />
              </button>
            ))}
            {rating > 0 && (
              <span style={{ marginLeft: 8, fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>
                {RATING_LABELS[rating]}
              </span>
            )}
          </div>
        </div>

        <div className="field-group" style={{ marginBottom: 16 }}>
          <label className="label" htmlFor="review-comment">
            Your review <span className="hint">(optional)</span>
          </label>
          <textarea
            id="review-comment"
            className="textarea"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share details about your experience…"
          />
        </div>

        {error && (
          <p className="callout callout--danger" style={{ marginBottom: 12 }}>
            <Icon name="alert-triangle" size={16} />
            {error}
          </p>
        )}

        <Button type="submit" loading={loading}>
          Submit review
        </Button>
      </form>
    </div>
  );
}
