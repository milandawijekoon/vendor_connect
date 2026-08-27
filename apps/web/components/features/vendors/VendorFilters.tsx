'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { CategoryDto } from '@vendorconnect/shared';
import { Button, Input, Select } from '../../ui/primitives';

const FALLBACK_CITIES = [
  'Colombo', 'Kandy', 'Galle', 'Negombo', 'Jaffna',
  'Trincomalee', 'Matara', 'Kurunegala', 'Anuradhapura',
  'Ratnapura', 'Batticaloa', 'Nuwara Eliya', 'Moratuwa', 'Kalutara',
];

interface Props {
  categories: CategoryDto[];
  cities?: string[];
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 20, marginBottom: 20 }}>
      <p
        style={{
          fontSize: 12,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--text)',
          marginBottom: 12,
        }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

export function VendorFilters({ categories, cities }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cityList = cities && cities.length > 0 ? cities : FALLBACK_CITIES;

  const [localQ, setLocalQ] = useState(searchParams.get('q') ?? '');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setLocalQ(searchParams.get('q') ?? '');
  }, [searchParams]);

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete('page');
      router.push(`/vendors?${params.toString()}`);
    },
    [router, searchParams],
  );

  const handleQChange = (value: string) => {
    setLocalQ(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateFilter('q', value), 400);
  };

  const applyBudget = (min: string, max: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (min) params.set('priceMin', min);
    else params.delete('priceMin');
    if (max) params.set('priceMax', max);
    else params.delete('priceMax');
    params.delete('page');
    router.push(`/vendors?${params.toString()}`);
  };

  const clearAll = () => {
    setLocalQ('');
    router.push('/vendors');
  };

  const hasFilters = !!(
    searchParams.get('q') ||
    searchParams.get('city') ||
    searchParams.get('categorySlug') ||
    searchParams.get('priceMin') ||
    searchParams.get('priceMax')
  );

  return (
    <div>
      <FilterSection title="Search">
        <Input
          icon="search"
          type="text"
          placeholder="Vendor name, city…"
          value={localQ}
          onChange={(e) => handleQChange(e.target.value)}
        />
      </FilterSection>

      <FilterSection title="Category">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '3px 0' }}>
            <input
              type="radio"
              name="categorySlug"
              value=""
              checked={!searchParams.get('categorySlug')}
              onChange={() => updateFilter('categorySlug', '')}
              style={{ accentColor: 'var(--primary)' }}
            />
            <span style={{ fontSize: 14, color: 'var(--text)' }}>All categories</span>
          </label>
          {categories.map((c) => (
            <label
              key={c.id}
              style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '3px 0' }}
            >
              <input
                type="radio"
                name="categorySlug"
                value={c.slug}
                checked={searchParams.get('categorySlug') === c.slug}
                onChange={() => updateFilter('categorySlug', c.slug)}
                style={{ accentColor: 'var(--primary)' }}
              />
              <span style={{ fontSize: 14, color: 'var(--text)' }}>
                {c.name}
                {typeof c.vendorCount === 'number' && c.vendorCount > 0 && (
                  <span style={{ color: 'var(--text-muted)' }}> ({c.vendorCount})</span>
                )}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="City">
        <Select value={searchParams.get('city') ?? ''} onChange={(e) => updateFilter('city', e.target.value)}>
          <option value="">All cities</option>
          {cityList.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </Select>
      </FilterSection>

      <FilterSection title="Budget (LKR)">
        <div style={{ display: 'flex', gap: 8 }}>
          <Input
            type="number"
            placeholder="Min"
            min={0}
            value={searchParams.get('priceMin') ?? ''}
            onChange={(e) => updateFilter('priceMin', e.target.value)}
          />
          <Input
            type="number"
            placeholder="Max"
            min={0}
            value={searchParams.get('priceMax') ?? ''}
            onChange={(e) => updateFilter('priceMax', e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
          {[
            { label: 'Under 50K', min: '', max: '50000' },
            { label: '50K–150K', min: '50000', max: '150000' },
            { label: '150K+', min: '150000', max: '' },
          ].map((preset) => (
            <Button key={preset.label} variant="ghost" size="sm" onClick={() => applyBudget(preset.min, preset.max)}>
              {preset.label}
            </Button>
          ))}
        </div>
      </FilterSection>

      {hasFilters && (
        <Button variant="outline" block iconLeft="x" onClick={clearAll}>
          Clear all filters
        </Button>
      )}
    </div>
  );
}
