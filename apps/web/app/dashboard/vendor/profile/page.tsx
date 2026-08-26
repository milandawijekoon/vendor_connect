'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { VendorProfileDto } from '@vendorconnect/shared';
import { ApiClientError } from '../../../../lib/api/client';
import { vendorsApi } from '../../../../lib/api/vendors';
import { VendorProfileForm } from '../../../../components/features/vendors/VendorProfileForm';

export default function EditVendorProfilePage() {
  const [existing, setExisting] = useState<VendorProfileDto | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    vendorsApi
      .getOwn()
      .then(setExisting)
      .catch((err) => {
        // 404 = no profile yet — render create form
        if (!(err instanceof ApiClientError && err.statusCode === 404)) {
          console.error(err);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <main style={{ padding: 32 }}>Loading…</main>;

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '32px 16px' }}>
      <h1 style={{ marginBottom: 24 }}>{existing ? 'Edit profile' : 'Create your vendor profile'}</h1>
      <VendorProfileForm
        {...(existing ? { initialValues: existing } : {})}
        onSuccess={() => router.push('/dashboard/vendor')}
      />
    </main>
  );
}
