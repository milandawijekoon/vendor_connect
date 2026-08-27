'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { VendorProfileDto } from '@vendorconnect/shared';
import { Role } from '@vendorconnect/shared';
import { ApiClientError } from '../../../../lib/api/client';
import { vendorsApi } from '../../../../lib/api/vendors';
import { VendorProfileForm } from '../../../../components/features/vendors/VendorProfileForm';
import { DashboardShell } from '../../../../components/ui/DashboardShell';
import { LoadingBlock, PageHeader } from '../../../../components/ui/primitives';

export default function EditVendorProfilePage() {
  const [existing, setExisting] = useState<VendorProfileDto | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    vendorsApi
      .getOwn()
      .then(setExisting)
      .catch((err) => {
        if (!(err instanceof ApiClientError && err.statusCode === 404)) {
          console.error(err);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <DashboardShell requireRole={Role.VENDOR}>
      <PageHeader
        eyebrow="Vendor"
        title={existing ? 'Edit business profile' : 'Create your business profile'}
        description="This is what customers see on your public listing."
      />
      {isLoading ? (
        <LoadingBlock />
      ) : (
        <div style={{ maxWidth: 640 }}>
          <VendorProfileForm
            {...(existing ? { initialValues: existing } : {})}
            onSuccess={() => router.push('/dashboard/vendor')}
          />
        </div>
      )}
    </DashboardShell>
  );
}
