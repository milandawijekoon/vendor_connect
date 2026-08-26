'use client';

import { useEffect, useState } from 'react';
import type { CategoryDto, VendorProfileDto } from '@vendorconnect/shared';
import { categoriesApi } from '../../../lib/api/categories';
import { vendorsApi } from '../../../lib/api/vendors';
import { vendorProfileSchema, type VendorProfileFormValues } from '../../../lib/validation/vendor';

interface Props {
  initialValues?: VendorProfileDto;
  onSuccess: (profile: VendorProfileDto) => void;
}

export function VendorProfileForm({ initialValues, onSuccess }: Props) {
  const isEditing = Boolean(initialValues);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    categoriesApi.getAll().then(setCategories).catch(console.error);
  }, []);

  const selectedCategoryIds = initialValues?.categories.map((c) => c.id) ?? [];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError('');

    const fd = new FormData(e.currentTarget);
    const raw: Record<string, unknown> = {
      businessName: fd.get('businessName'),
      description: fd.get('description'),
      city: fd.get('city'),
      address: fd.get('address') || undefined,
      priceMin: fd.get('priceMin') || undefined,
      priceMax: fd.get('priceMax') || undefined,
      categoryIds: fd.getAll('categoryIds'),
    };

    const result = vendorProfileSchema.safeParse(raw);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach((i) => { errs[String(i.path[0])] = i.message; });
      setErrors(errs);
      return;
    }
    setErrors({});

    try {
      setIsSubmitting(true);
      const data = result.data as VendorProfileFormValues;
      const profile = isEditing ? await vendorsApi.update(data) : await vendorsApi.create(data);
      onSuccess(profile);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  }

  const fieldStyle = { display: 'block', width: '100%', marginTop: 4, padding: '6px 8px', boxSizing: 'border-box' as const };
  const labelStyle = { display: 'block', marginBottom: 12 };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} noValidate>
      {serverError && <p style={{ color: 'red', marginBottom: 12 }}>{serverError}</p>}

      <label style={labelStyle}>
        Business name *
        <input name="businessName" defaultValue={initialValues?.businessName} style={fieldStyle} />
        {errors['businessName'] && <span style={{ color: 'red', fontSize: 13 }}>{errors['businessName']}</span>}
      </label>

      <label style={labelStyle}>
        Description * (min 20 characters)
        <textarea name="description" rows={5} defaultValue={initialValues?.description} style={fieldStyle} />
        {errors['description'] && <span style={{ color: 'red', fontSize: 13 }}>{errors['description']}</span>}
      </label>

      <label style={labelStyle}>
        City *
        <input name="city" defaultValue={initialValues?.city} style={fieldStyle} />
        {errors['city'] && <span style={{ color: 'red', fontSize: 13 }}>{errors['city']}</span>}
      </label>

      <label style={labelStyle}>
        Full address (optional)
        <input name="address" defaultValue={initialValues?.address ?? ''} style={fieldStyle} />
      </label>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <label>
          Min price (LKR)
          <input name="priceMin" type="number" min={0} defaultValue={initialValues?.priceMin ?? ''} style={fieldStyle} />
        </label>
        <label>
          Max price (LKR)
          <input name="priceMax" type="number" min={0} defaultValue={initialValues?.priceMax ?? ''} style={fieldStyle} />
        </label>
      </div>

      {categories.length > 0 && (
        <fieldset style={{ marginBottom: 16, padding: 12, border: '1px solid #ccc', borderRadius: 6 }}>
          <legend>Categories</legend>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8, marginTop: 8 }}>
            {categories.map((cat) => (
              <label key={cat.id} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input
                  type="checkbox"
                  name="categoryIds"
                  value={cat.id}
                  defaultChecked={selectedCategoryIds.includes(cat.id)}
                />
                {cat.name}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <button type="submit" disabled={isSubmitting} style={{ padding: '8px 24px' }}>
        {isSubmitting ? 'Saving…' : isEditing ? 'Save changes' : 'Create profile'}
      </button>
    </form>
  );
}
