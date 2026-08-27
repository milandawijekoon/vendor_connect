'use client';

import { useRef, useState } from 'react';
import type { PortfolioImageDto } from '@vendorconnect/shared';
import { vendorsApi } from '../../../lib/api/vendors';
import { Icon } from '../../ui/icons';

interface Props {
  images: PortfolioImageDto[];
  onChange: (images: PortfolioImageDto[]) => void;
}

const MAX_IMAGES = 20;

export function PortfolioUploader({ images, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const full = images.length >= MAX_IMAGES;

  async function uploadFiles(files: File[]) {
    if (!files.length) return;
    setError('');
    setUploading(true);
    try {
      const uploaded: PortfolioImageDto[] = [];
      for (const file of files.slice(0, MAX_IMAGES - images.length)) {
        uploaded.push(await vendorsApi.uploadImage(file));
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
    setError('');
    try {
      await vendorsApi.deleteImage(imageId);
      onChange(images.filter((i) => i.id !== imageId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  }

  return (
    <div>
      {error && (
        <p className="callout callout--danger" style={{ marginBottom: 12 }}>
          <Icon name="alert-triangle" size={16} />
          {error}
        </p>
      )}

      {images.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: 12,
            marginBottom: 16,
          }}
        >
          {images.map((img) => (
            <div
              key={img.id}
              style={{
                position: 'relative',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: '1px solid var(--border)',
                aspectRatio: '4 / 3',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="Portfolio" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                type="button"
                onClick={() => void handleDelete(img.id)}
                aria-label="Remove photo"
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(17,24,20,0.62)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                }}
              >
                <Icon name="trash" size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {!full && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            void uploadFiles(Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/')));
          }}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            padding: '32px 20px',
            border: `1.5px dashed ${dragging ? 'var(--primary)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-lg)',
            background: dragging ? 'var(--primary-bg)' : 'var(--surface)',
            color: 'var(--text-sec)',
            cursor: 'pointer',
            transition: 'border-color 0.15s, background 0.15s',
          }}
        >
          <Icon name="upload" size={22} />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
            {uploading ? 'Uploading…' : 'Drop photos here or click to browse'}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            JPEG, PNG or WebP · max 5 MB each · {images.length}/{MAX_IMAGES} used
          </span>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={uploading}
            onChange={(e) => void uploadFiles(Array.from(e.target.files ?? []))}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {full && (
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          You&apos;ve reached the {MAX_IMAGES}-photo limit. Remove a photo to add a new one.
        </p>
      )}
    </div>
  );
}
