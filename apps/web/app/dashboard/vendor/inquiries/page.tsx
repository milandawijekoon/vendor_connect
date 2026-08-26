'use client';

import { useEffect, useState } from 'react';
import type { InquiryDto, InquiryStatus } from '@vendorconnect/shared';
import { InquiryStatus as IS } from '@vendorconnect/shared';
import { inquiriesApi } from '../../../../lib/api/inquiries';
import { ApiClientError } from '../../../../lib/api/client';

const STATUS_META: Record<InquiryStatus, { label: string; color: string; bg: string }> = {
  NEW:       { label: 'New',       color: '#92400e', bg: '#fef3c7' },
  CONTACTED: { label: 'Contacted', color: '#1e40af', bg: '#dbeafe' },
  CONFIRMED: { label: 'Confirmed', color: '#14532d', bg: '#dcfce7' },
  CLOSED:    { label: 'Closed',    color: '#374151', bg: '#f3f4f6' },
};

const NEXT_STATUS: Partial<Record<InquiryStatus, InquiryStatus[]>> = {
  [IS.NEW]:       [IS.CONTACTED, IS.CLOSED],
  [IS.CONTACTED]: [IS.CONFIRMED, IS.CLOSED],
  [IS.CONFIRMED]: [IS.CLOSED],
};

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<InquiryDto[]>([]);
  const [filter, setFilter] = useState<InquiryStatus | ''>('');
  const [isLoading, setIsLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    inquiriesApi
      .list(filter ? { status: filter } : {})
      .then((res) => setInquiries(res.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [filter]);

  const updateStatus = async (id: string, status: InquiryStatus) => {
    setUpdating(id);
    try {
      const updated = await inquiriesApi.updateStatus(id, status);
      setInquiries((prev) => prev.map((i) => (i.id === id ? updated : i)));
    } catch (err) {
      alert(err instanceof ApiClientError ? err.message : 'Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>Inquiries</h1>

        {/* Status filter */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as InquiryStatus | '')}
          style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: 6,
            fontSize: 14,
            background: 'transparent',
            color: 'inherit',
          }}
        >
          <option value="">All statuses</option>
          {Object.values(IS).map((s) => (
            <option key={s} value={s}>{STATUS_META[s].label}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p style={{ color: '#9ca3af' }}>Loading…</p>
      ) : inquiries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: '#9ca3af' }}>
          <p style={{ fontSize: 18, margin: '0 0 8px' }}>No inquiries yet</p>
          <p style={{ fontSize: 14 }}>Once couples contact you, their inquiries will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {inquiries.map((inq) => {
            const meta = STATUS_META[inq.status];
            const nextOptions = NEXT_STATUS[inq.status] ?? [];
            return (
              <div
                key={inq.id}
                style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: 15 }}>{inq.name}</p>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: 13 }}>
                      {inq.email} · {inq.phone}
                      {inq.eventDate && ` · ${new Date(inq.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 600,
                        color: meta.color,
                        background: meta.bg,
                      }}
                    >
                      {meta.label}
                    </span>
                    {nextOptions.map((next) => (
                      <button
                        key={next}
                        disabled={updating === inq.id}
                        onClick={() => void updateStatus(inq.id, next)}
                        style={{
                          padding: '4px 10px',
                          border: '1px solid #d1d5db',
                          borderRadius: 6,
                          fontSize: 12,
                          cursor: 'pointer',
                          background: 'transparent',
                          color: 'inherit',
                          opacity: updating === inq.id ? 0.5 : 1,
                        }}
                      >
                        → {STATUS_META[next].label}
                      </button>
                    ))}
                  </div>
                </div>
                <p style={{ margin: 0, lineHeight: 1.6, color: '#374151', fontSize: 14 }}>{inq.message}</p>
                <p style={{ margin: '8px 0 0', color: '#9ca3af', fontSize: 12 }}>
                  {new Date(inq.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
