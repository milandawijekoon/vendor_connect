'use client';

import { useEffect, useState } from 'react';
import type { InquiryDto, InquiryStatus } from '@vendorconnect/shared';
import { InquiryStatus as IS, Role } from '@vendorconnect/shared';
import { inquiriesApi } from '../../../../lib/api/inquiries';
import { ApiClientError } from '../../../../lib/api/client';
import { DashboardShell } from '../../../../components/ui/DashboardShell';
import {
  Badge,
  Button,
  EmptyState,
  INQUIRY_STATUS_TONE,
  LoadingBlock,
  PageHeader,
  Select,
} from '../../../../components/ui/primitives';
import { Icon } from '../../../../components/ui/icons';

const NEXT_STATUS: Partial<Record<InquiryStatus, InquiryStatus[]>> = {
  [IS.NEW]: [IS.CONTACTED, IS.CLOSED],
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
    <DashboardShell requireRole={Role.VENDOR}>
      <PageHeader
        eyebrow="Vendor"
        title="Inquiries"
        description="Leads from customers who contacted you through your listing."
        actions={
          <div style={{ minWidth: 180 }}>
            <Select value={filter} onChange={(e) => setFilter(e.target.value as InquiryStatus | '')} aria-label="Filter by status">
              <option value="">All statuses</option>
              {Object.values(IS).map((s) => (
                <option key={s} value={s}>
                  {INQUIRY_STATUS_TONE[s]?.label ?? s}
                </option>
              ))}
            </Select>
          </div>
        }
      />

      {isLoading ? (
        <LoadingBlock />
      ) : inquiries.length === 0 ? (
        <EmptyState
          icon="inbox"
          title="No inquiries yet"
          body="When customers contact you through your listing, their messages appear here."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {inquiries.map((inq) => {
            const meta = INQUIRY_STATUS_TONE[inq.status] ?? { tone: 'neutral' as const, label: inq.status };
            const nextOptions = NEXT_STATUS[inq.status] ?? [];
            return (
              <div
                key={inq.id}
                style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 18 }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 12,
                    flexWrap: 'wrap',
                    gap: 10,
                  }}
                >
                  <div>
                    <p style={{ margin: '0 0 3px', fontWeight: 700, fontSize: 15 }}>{inq.name}</p>
                    <p
                      style={{
                        margin: 0,
                        color: 'var(--text-sec)',
                        fontSize: 13,
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 10,
                      }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Icon name="mail" size={13} />
                        {inq.email}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Icon name="phone" size={13} />
                        {inq.phone}
                      </span>
                      {inq.eventDate && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Icon name="calendar" size={13} />
                          {new Date(inq.eventDate).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      )}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                    {nextOptions.map((next) => (
                      <Button
                        key={next}
                        variant="outline"
                        size="sm"
                        loading={updating === inq.id}
                        onClick={() => void updateStatus(inq.id, next)}
                      >
                        Mark {INQUIRY_STATUS_TONE[next]?.label.toLowerCase() ?? next}
                      </Button>
                    ))}
                  </div>
                </div>
                <p style={{ margin: 0, lineHeight: 1.6, color: 'var(--text)', fontSize: 14 }}>{inq.message}</p>
                <p style={{ margin: '10px 0 0', color: 'var(--text-muted)', fontSize: 12 }}>
                  {new Date(inq.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
