'use client';

import { useEffect, useState } from 'react';
import type { GoldPriceSnapshotDto } from '@vendorconnect/shared';
import { goldApi } from '../api/gold';

let cache: GoldPriceSnapshotDto | null = null;
let inflight: Promise<GoldPriceSnapshotDto | null> | null = null;

/**
 * Fetch the latest gold price once per page load and share it across components.
 * Returns `null` while loading, on error, or before the first server-side fetch.
 */
export function useGoldPrice(): GoldPriceSnapshotDto | null {
  const [price, setPrice] = useState<GoldPriceSnapshotDto | null>(cache);

  useEffect(() => {
    if (cache) return;
    inflight ??= goldApi
      .getLatest()
      .then((data) => {
        cache = data;
        return data;
      })
      .catch(() => {
        inflight = null;
        return null;
      });
    void inflight.then(setPrice);
  }, []);

  return price;
}
