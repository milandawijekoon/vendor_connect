/**
 * Daily gold price snapshot, sourced from the LBMA benchmark auction and the
 * daily USD->LKR rate. World figures are USD per unit; `lkr*` figures apply the
 * exchange rate. All `*PerGram*` values already include `retailPremiumPct`
 * (0 = pure metal value).
 */
export interface GoldPriceSnapshotDto {
  id: string;
  /** LBMA auction date, ISO `YYYY-MM-DD` (London date). */
  auctionDate: string;
  /** `am` or `pm` auction. */
  auction: string;
  /** Upstream benchmark, currently always `LBMA`. */
  source: string;

  usdPerOz: number;
  usdToLkr: number;
  /** Retail/jeweller premium folded into the per-gram figures (0–1). */
  retailPremiumPct: number;

  worldPerGram24k: number;
  worldPerGram22k: number;
  worldPerGram18k: number;

  lkrPerGram24k: number;
  lkrPerGram22k: number;
  lkrPerGram18k: number;
  /** 22K value of one 8 g Sri Lankan pawning sovereign. */
  lkrPerSovereign22k: number;

  /** When the upstream data was produced (ISO 8601). */
  fetchedAt: string;
  createdAt: string;
  updatedAt: string;
}
