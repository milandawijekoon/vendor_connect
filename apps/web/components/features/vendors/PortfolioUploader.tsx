'use client';

import { useRef, useState } from 'react';
import type { PortfolioImageDto } from '@vendorconnect/shared';
import { vendorsApi } from '../../../lib/api/vendors';

interface Props {
  images: PortfolioImageDto[];
  onChange: (images: PortfolioImageDto[]) => void;
}

export function PortfolioUploader({ images, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setError('');
    setUploading(true);

    try {
      const uploaded: PortfolioImageDto[] = [];
      for (const file of files) {
        const img = await vendorsApi.uploadImage(file);
        uploaded.push(img);
      }
      onChange([...images, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function handleDelete(imageId: string) {
    try {
      await vendorsApi.deleteImage(imageId);
      onChange(images.filter((i) => i.id !== imageId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  return (
    <div>
      {error && <p style={{ color: 'red', marginBottom: 8 }}>{error}</p>}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 12,
          marginBottom: 16,
        }}
      >
        {images.map((img) => (
          <div key={img.id} style={{ position: 'relative' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt="Portfolio"
              style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 6 }}
            />
            <button
              type="button"
              onClick={() => void handleDelete(img.id)}
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                background: 'rgba(0,0,0,0.6)',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                padding: '2px 6px',
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <label style={{ display: 'inline-block', cursor: 'pointer' }}>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(e) => void handleFileChange(e)}
          style={{ display: 'none' }}
          disabled={uploading || images.length >= 20}
        />
        <span
          style={{
            display: 'inline-block',
            padding: '8px 20px',
            border: '1px dashed #999',
            borderRadius: 6,
            color: '#555',
          }}
        >
          {uploading ? 'Uploading…' : '+ Add photos (JPEG / PNG / WebP, max 5 MB each)'}
        </span>
      </label>
      {images.length >= 20 && <p style={{ color: '#888', fontSize: 13 }}>Maximum 20 images reached.</p>}
    </div>
  );
}
