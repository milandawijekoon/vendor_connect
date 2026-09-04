/**
 * USD -> LKR (and other currencies) via open.er-api.com — free, no API key.
 * Rates are updated once per day, which matches the LBMA fixing cadence.
 */

const DEFAULT_FX_URL = "https://open.er-api.com/v6/latest/USD";
const DEFAULT_TIMEOUT_MS = 10_000;

export type FxRate = {
  base: string;
  quote: string;
  rate: number;
  /** When the provider last refreshed the rate, if supplied. */
  asOf: string | null;
};

export type FetchFxOptions = {
  /** ISO 4217 code to price USD in. Defaults to `LKR`. */
  quote?: string;
  timeoutMs?: number;
  url?: string;
  fetchImpl?: typeof fetch;
};

type ErApiResponse = {
  result?: string;
  time_last_update_utc?: string;
  rates?: Record<string, number>;
};

/**
 * Fetch the current USD -> `quote` exchange rate.
 *
 * @throws if the request fails or the requested currency is missing.
 */
export async function fetchUsdRate(options: FetchFxOptions = {}): Promise<FxRate> {
  const quote = (options.quote ?? "LKR").toUpperCase();
  const doFetch = options.fetchImpl ?? fetch;

  const res = await doFetch(options.url ?? DEFAULT_FX_URL, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new Error(`FX fetch failed: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as ErApiResponse;
  if (data.result && data.result !== "success") {
    throw new Error(`FX provider returned result="${data.result}"`);
  }

  const rate = data.rates?.[quote];
  if (typeof rate !== "number" || !Number.isFinite(rate) || rate <= 0) {
    throw new Error(`FX response missing a usable USD->${quote} rate`);
  }

  return {
    base: "USD",
    quote,
    rate,
    asOf: data.time_last_update_utc ?? null,
  };
}
