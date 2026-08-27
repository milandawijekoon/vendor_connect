'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { PaginatedResponse, ReviewDto, VendorProfileDto } from '@vendorconnect/shared';
import { InquiryForm } from '../../../components/features/inquiries/InquiryForm';
import { ReviewList } from '../../../components/features/reviews/ReviewList';
import { ReviewForm } from '../../../components/features/reviews/ReviewForm';

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1';

async function getVendor(slug: string): Promise<VendorProfileDto | null> {
  try {
    const res = await fetch(`${API_BASE}/vendors/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json() as Promise<VendorProfileDto>;
  } catch { return null; }
}

async function getReviews(slug: string): Promise<ReviewDto[]> {
  try {
    const res = await fetch(`${API_BASE}/vendors/${slug}/reviews?limit=50`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = (await res.json()) as PaginatedResponse<ReviewDto>;
    return data.data;
  } catch { return []; }
}

function StarBar({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ color: i < full ? 'var(--star)' : '#D1D5DB', fontSize: 20 }}>★</span>
      ))}
    </span>
  );
}

export default function VendorProfilePage({ params }: { params: { slug: string } }) {
  const [vendor, setVendor] = useState<VendorProfileDto | null | undefined>(undefined);
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    void (async () => {
      const [v, r] = await Promise.all([getVendor(params.slug), getReviews(params.slug)]);
      setVendor(v);
      setReviews(r);
    })();
  }, [params.slug]);

  if (vendor === undefined) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
          <p style={{ color: 'var(--text-sec)' }}>Loading vendor…</p>
        </div>
      </div>
    );
  }
  if (vendor === null) return notFound();

  const images = vendor.images;

  return (
    <>
      {/* Breadcrumb */}
      <div style={{ background: 'var(--primary-bg)', borderBottom: '1px solid var(--primary-light)', padding: '14px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-sec)' }}>
            <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
            <span>›</span>
            <Link href="/vendors" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Vendors</Link>
            <span>›</span>
            {vendor.categories[0] && (
              <><Link href={`/vendors?categorySlug=${vendor.categories[0].slug}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{vendor.categories[0].name}</Link><span>›</span></>
            )}
            <span style={{ color: 'var(--text)', fontWeight: 600 }}>{vendor.businessName}</span>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 20px 64px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 40, alignItems: 'flex-start' }}>
          {/* LEFT COLUMN */}
          <div>
            {/* Header */}
            <div style={{ marginBottom: 20 }}>
              {vendor.categories.map((c) => (
                <span key={c.id} className="badge badge-pink" style={{ marginRight: 6 }}>{c.name}</span>
              ))}
              <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)', margin: '10px 0 6px', lineHeight: 1.2 }}>
                {vendor.businessName}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-sec)', fontSize: 15 }}>
                  <span>📍</span> {vendor.city}{vendor.address ? `, ${vendor.address}` : ''}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <StarBar rating={vendor.avgRating} />
                  <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>{vendor.avgRating.toFixed(1)}</span>
                  <span style={{ color: 'var(--text-sec)', fontSize: 14 }}>({vendor.reviewCount} review{vendor.reviewCount !== 1 ? 's' : ''})</span>
                </span>
              </div>
            </div>

            {/* Photo gallery */}
            {images.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div style={{
                  borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                  background: 'var(--primary-light)', marginBottom: 8, height: 400,
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={images[activeImage]?.url ?? images[0]!.url}
                    alt={vendor.businessName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                {images.length > 1 && (
                  <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                    {images.map((img, i) => (
                      <button key={img.id} onClick={() => setActiveImage(i)} style={{
                        flexShrink: 0, width: 80, height: 60, padding: 0, border: 'none',
                        borderRadius: 'var(--radius-sm)', overflow: 'hidden', cursor: 'pointer',
                        outline: i === activeImage ? '2.5px solid var(--primary)' : 'none',
                        opacity: i === activeImage ? 1 : 0.7,
                        transition: 'opacity 0.15s',
                      }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Stats row */}
            <div style={{
              display: 'flex', gap: 0,
              background: 'var(--primary-bg)',
              border: '1px solid var(--primary-light)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden', marginBottom: 32,
            }}>
              {[
                { icon: '⭐', value: vendor.avgRating.toFixed(1), label: 'Avg Rating' },
                { icon: '💬', value: vendor.reviewCount, label: 'Reviews' },
                ...(vendor.priceMin ?? vendor.priceMax ? [{ icon: '💰', value: `LKR ${(vendor.priceMin ?? vendor.priceMax ?? 0).toLocaleString()}+`, label: 'Starting from' }] : []),
                { icon: '👤', value: vendor.owner.name, label: 'Contact Person' },
              ].map((s, i, arr) => (
                <div key={String(s.label)} style={{
                  flex: 1, textAlign: 'center', padding: '16px 12px',
                  borderRight: i < arr.length - 1 ? '1px solid var(--primary-light)' : 'none',
                }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-sec)' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* About */}
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 14, color: 'var(--text)' }}>About {vendor.businessName}</h2>
              <p style={{ lineHeight: 1.8, color: 'var(--text-sec)', whiteSpace: 'pre-line', fontSize: 15 }}>{vendor.description}</p>
            </section>

            <div className="divider" />

            {/* Reviews */}
            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>
                  Reviews {vendor.reviewCount > 0 ? `(${vendor.reviewCount})` : ''}
                </h2>
                {vendor.reviewCount > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StarBar rating={vendor.avgRating} />
                    <span style={{ fontWeight: 700, color: 'var(--text)' }}>{vendor.avgRating.toFixed(1)}/5</span>
                  </div>
                )}
              </div>

              <ReviewList reviews={reviews} />

              <div style={{ marginTop: 24 }}>
                <ReviewForm vendorSlug={params.slug} onReviewSubmitted={(r) => setReviews((prev) => [r, ...prev])} />
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN — sticky contact panel */}
          <div style={{ position: 'sticky', top: 'calc(var(--nav-h) + 20px)' }}>
            {/* Price card */}
            {(vendor.priceMin ?? vendor.priceMax) && (
              <div style={{
                background: 'var(--white)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', padding: '20px 22px', marginBottom: 16,
                boxShadow: 'var(--shadow-sm)',
              }}>
                <p style={{ fontSize: 13, color: 'var(--text-sec)', marginBottom: 4 }}>Price range</p>
                <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>
                  {vendor.priceMin ? `LKR ${vendor.priceMin.toLocaleString()}` : ''}
                  {vendor.priceMin && vendor.priceMax ? ' – ' : ''}
                  {vendor.priceMax ? `LKR ${vendor.priceMax.toLocaleString()}` : ''}
                </p>
              </div>
            )}

            {/* Inquiry form */}
            <InquiryForm vendorSlug={params.slug} vendorName={vendor.businessName} />
          </div>
        </div>
      </div>
    </>
  );
}
