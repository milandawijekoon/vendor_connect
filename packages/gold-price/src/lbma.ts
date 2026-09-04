/**
 * LBMA Gold Price — the official global gold benchmark, set by an ICE-run
 * auction twice per London business day (10:30 "AM" and 15:00 "PM").
 *
 * LBMA publishes each auction's results as a free chronological JSON array:
 *   [{ "d": "2026-09-03", "v": [usdPerOz, gbpPerOz, eurPerOz] }, ...]
 *
 * The values are per troy ounce. Non-trading days simply have no new row, so
 * "latest" naturally returns the most recent business day's fixing.
 */

const LBMA_URLS = {
  am: "https://prices.lbma.org.uk/json/gold_am.json",
  pm: "https://prices.lbma.org.uk/json/gold_pm.json",
} as const;

const DEFAULT_TIMEOUT_MS = 10_000;

export type LbmaAuction = "am" | "pm";

export type LbmaGoldPrice = {
  /** Auction to which this price belongs. */
  auction: LbmaAuction;
  /** Auction date, ISO `YYYY-MM-DD` (London date). */
  date: string;
  usdPerOz: number;
  gbpPerOz: number | null;
  eurPerOz: number | null;
};

export type FetchLbmaOptions = {
  /** Which daily auction to read. Defaults to the PM fixing (the common daily reference). */
  auction?: LbmaAuction;
  /** Abort the request after this many ms. Defaults to 10000. */
  timeoutMs?: number;
  /** Override the source URL (e.g. a cache/proxy or a pinned mirror). */
  url?: string;
  /** Custom fetch implementation, mainly for tests. Defaults to global `fetch`. */
  fetchImpl?: typeof fetch;
};

type LbmaRow = { d: string; v: Array<number | null> };

function isLbmaRow(value: unknown): value is LbmaRow {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as LbmaRow).d === "string" &&
    Array.isArray((value as LbmaRow).v)
  );
}

/**
 * Fetch the most recent LBMA gold fixing.
 *
 * @throws if the network request fails, the payload is not the expected shape,
 *         or no row carries a usable USD price.
 */
export async function fetchLbmaGoldPrice(
  options: FetchLbmaOptions = {},
): Promise<LbmaGoldPrice> {
  const auction: LbmaAuction = options.auction ?? "pm";
  const url = options.url ?? LBMA_URLS[auction];
  const doFetch = options.fetchImpl ?? fetch;

  const res = await doFetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new Error(`LBMA fetch failed: ${res.status} ${res.statusText}`);
  }

  const payload: unknown = await res.json();
  if (!Array.isArray(payload)) {
    throw new Error("LBMA response was not a JSON array");
  }

  const rows = payload.filter(isLbmaRow);
  for (let i = rows.length - 1; i >= 0; i--) {
    const row = rows[i];
    if (!row) continue;
    const usd = row.v[0];
    if (typeof usd !== "number" || !Number.isFinite(usd)) continue;

    const gbpRaw = row.v[1];
    const eurRaw = row.v[2];
    return {
      auction,
      date: row.d,
      usdPerOz: usd,
      gbpPerOz: typeof gbpRaw === "number" && Number.isFinite(gbpRaw) ? gbpRaw : null,
      eurPerOz: typeof eurRaw === "number" && Number.isFinite(eurRaw) ? eurRaw : null,
    };
  }

  throw new Error("LBMA response contained no row with a usable USD price");
}
