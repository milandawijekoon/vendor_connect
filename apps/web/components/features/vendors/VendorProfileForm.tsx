'use client';

import { useEffect, useState } from 'react';
import type { CategoryDto, CityStatDto, VendorProfileDto } from '@vendorconnect/shared';
import { categoriesApi } from '../../../lib/api/categories';
import { metaApi } from '../../../lib/api/meta';
import { vendorsApi } from '../../../lib/api/vendors';
import { vendorProfileSchema, type VendorProfileFormValues } from '../../../lib/validation/vendor';
import { Button, Field, Input, Textarea } from '../../ui/primitives';
import { Icon, categoryIcon } from '../../ui/icons';

interface Props {
  initialValues?: VendorProfileDto;
  onSuccess: (profile: VendorProfileDto) => void;
}

export function VendorProfileForm({ initialValues, onSuccess }: Props) {
  const isEditing = Boolean(initialValues);

  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [cities, setCities] = useState<CityStatDto[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    businessName: initialValues?.businessName ?? '',
    description: initialValues?.description ?? '',
    city: initialValues?.city ?? '',
    address: initialValues?.address ?? '',
    priceMin: initialValues?.priceMin?.toString() ?? '',
    priceMax: initialValues?.priceMax?.toString() ?? '',
  });
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    initialValues?.categories.map((c) => c.id) ?? [],
  );

  useEffect(() => {
    categoriesApi.getAll().then(setCategories).catch(console.error);
    metaApi.getCities().then(setCities).catch(() => setCities([]));
  }, []);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const toggleCategory = (id: string) =>
    setSelectedCategoryIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError('');

    const raw = {
      businessName: form.businessName,
      description: form.description,
      city: form.city,
      address: form.address || undefined,
      priceMin: form.priceMin || undefined,
      priceMax: form.priceMax || undefined,
      categoryIds: selectedCategoryIds,
    };

    const result = vendorProfileSchema.safeParse(raw);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach((i) => {
        errs[String(i.path[0])] = i.message;
      });
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

  return (
    <form onSubmit={(e) => void handleSubmit(e)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {serverError && (
        <p className="callout callout--danger">
          <Icon name="alert-triangle" size={16} />
          {serverError}
        </p>
      )}

      <Field label="Business name" htmlFor="vp-name" required error={errors['businessName']}>
        <Input id="vp-name" value={form.businessName} onChange={set('businessName')} invalid={!!errors['businessName']} />
      </Field>

      <Field
        label="Description"
        htmlFor="vp-desc"
        required
        hint="At least 20 characters — describe your services, experience and what makes you stand out."
        error={errors['description']}
      >
        <Textarea id="vp-desc" rows={5} value={form.description} onChange={set('description')} invalid={!!errors['description']} />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Field label="City" htmlFor="vp-city" required error={errors['city']}>
          <Input
            id="vp-city"
            list="vp-city-options"
            value={form.city}
            onChange={set('city')}
            invalid={!!errors['city']}
            placeholder="e.g. Colombo"
          />
          <datalist id="vp-city-options">
            {cities.map((c) => (
              <option key={c.city} value={c.city} />
            ))}
          </datalist>
        </Field>

        <Field label="Full address" htmlFor="vp-address" hint="Optional">
          <Input id="vp-address" value={form.address} onChange={set('address')} />
        </Field>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Field label="Minimum price (LKR)" htmlFor="vp-min" hint="Optional">
          <Input id="vp-min" type="number" min={0} value={form.priceMin} onChange={set('priceMin')} />
        </Field>
        <Field label="Maximum price (LKR)" htmlFor="vp-max" hint="Optional">
          <Input id="vp-max" type="number" min={0} value={form.priceMax} onChange={set('priceMax')} />
        </Field>
      </div>

      {categories.length > 0 && (
        <Field label="Categories" hint="Choose every category your business serves.">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {categories.map((cat) => {
              const active = selectedCategoryIds.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  className="chip"
                  aria-pressed={active}
                  onClick={() => toggleCategory(cat.id)}
                >
                  <Icon name={active ? 'check' : categoryIcon(cat.slug)} size={14} />
                  {cat.name}
                </button>
              );
            })}
          </div>
        </Field>
      )}

      <div>
        <Button type="submit" loading={isSubmitting}>
          {isEditing ? 'Save changes' : 'Create profile'}
        </Button>
      </div>
    </form>
  );
}
