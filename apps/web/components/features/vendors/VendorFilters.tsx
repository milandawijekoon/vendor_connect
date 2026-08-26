'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { CategoryDto } from '@vendorconnect/shared';

const SRI_LANKA_CITIES = [
  'Colombo', 'Kandy', 'Galle', 'Negombo', 'Jaffna',
  'Trincomalee', 'Matara', 'Kurunegala', 'Anuradhapura',
  'Ratnapura', 'Batticaloa', 'Nuwara Eliya', 'Moratuwa', 'Kalutara',
];

interface Props {
  categories: CategoryDto[];
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 20, marginBottom: 20 }}>
      <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text)', marginBottom: 12 }}>
        {title}
      </p>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  border: '1.5px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  fontSize: 14,
  color: 'var(--text)',
  background: 'var(--white)',
  outline: 'none',
};

export function VendorFilters({ categories }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [localQ, setLocalQ] = useState(searchParams.get('q') ?? '');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setLocalQ(searchParams.get('q') ?? '');
  }, [searchParams]);

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value); else params.delete(key);
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

  const clearAll = () => { setLocalQ(''); router.push('/vendors'); };

  const hasFilters = !!(
    searchParams.get('q') || searchParams.get('city') ||
    searchParams.get('categorySlug') || searchParams.get('priceMin') || searchParams.get('priceMax')
  );

  return (
    <div>
      {/* Search */}
      <FilterSection title="Search">
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: 'var(--text-muted)' }}>🔍</span>
          <input
            type="text"
            placeholder="Vendor name, city…"
            value={localQ}
            onChange={(e) => handleQChange(e.target.value)}
            style={{ ...inputStyle, paddingLeft: 32 }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>
      </FilterSection>

      {/* Category */}
      <FilterSection title="Category">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
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
            <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="radio"
                name="categorySlug"
                value={c.slug}
                checked={searchParams.get('categorySlug') === c.slug}
                onChange={() => updateFilter('categorySlug', c.slug)}
                style={{ accentColor: 'var(--primary)' }}
              />
              <span style={{ fontSize: 14, color: 'var(--text)' }}>{c.name}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* City */}
      <FilterSection title="City">
        <select
          value={searchParams.get('city') ?? ''}
          onChange={(e) => updateFilter('city', e.target.value)}
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
        >
          <option value="">All cities</option>
          {SRI_LANKA_CITIES.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </FilterSection>

      {/* Budget */}
      <FilterSection title="Budget (LKR)">
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="number" placeholder="Min" min={0}
            value={searchParams.get('priceMin') ?? ''}
            onChange={(e) => updateFilter('priceMin', e.target.value)}
            style={{ ...inputStyle, width: '50%' }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
          />
          <input
            type="number" placeholder="Max" min={0}
            value={searchParams.get('priceMax') ?? ''}
            onChange={(e) => updateFilter('priceMax', e.target.value)}
            style={{ ...inputStyle, width: '50%' }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>
        {/* Quick budget presets */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
          {[
            { label: 'Under 50K', min: '', max: '50000' },
            { label: '50K–150K', min: '50000', max: '150000' },
            { label: '150K+', min: '150000', max: '' },
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                if (preset.min) params.set('priceMin', preset.min); else params.delete('priceMin');
                if (preset.max) params.set('priceMax', preset.max); else params.delete('priceMax');
                params.delete('page');
                router.push(`/vendors?${params.toString()}`);
              }}
              style={{
                padding: '4px 10px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-full)',
                background: 'transparent',
                fontSize: 12, cursor: 'pointer',
                color: 'var(--text-sec)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--primary)';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--primary)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-sec)';
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={clearAll}
          style={{
            width: '100%', padding: '10px 0',
            border: '1.5px solid var(--primary)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--primary-bg)',
            color: 'var(--primary)',
            fontSize: 14, fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
