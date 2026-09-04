# @vendorconnect/gold-price

Daily gold pricing for **Sri Lanka and the world**, from free no-key sources.

- **World price**: the [LBMA Gold Price](https://www.lbma.org.uk/prices-and-data/precious-metal-prices) — the official benchmark, set by auction twice per London business day (10:30 AM, 15:00 PM). Published free as JSON.
- **USD → LKR**: [open.er-api.com](https://www.exchangerate-api.com/docs/free) — free, no key, refreshed daily.
- **Sri Lanka rates**: derived — `LBMA USD/oz × USD→LKR`, split into 24K / 22K / 18K per gram and the 8 g pawning sovereign.

## Usage

```ts
import { fetchDailyGoldSnapshot } from "@vendorconnect/gold-price";

const snap = await fetchDailyGoldSnapshot();
// {
//   date: "2026-09-03", source: "LBMA", auction: "pm",
//   usdPerOz: 2655.4, usdToLkr: 302.15,
//   world:    { perOz, perGram24k, perGram22k, perGram18k },
//   sriLanka: { perOz, perGram24k, perGram22k, perGram18k, perSovereign22k },
//   fetchedAt: "2026-09-03T16:20:00.000Z"
// }
```

Add a jeweller/retail premium (import duty + margin, typically ~3–8%) to approximate the shop rate:

```ts
await fetchDailyGoldSnapshot({ retailPremiumPct: 0.05 }); // +5%
```

Lower-level helpers if you want to cache or source the parts yourself:

```ts
import {
  fetchLbmaGoldPrice, // { auction, date, usdPerOz, gbpPerOz, eurPerOz }
  fetchUsdRate,        // { base, quote, rate, asOf }
  worldGoldRates,     // (usdPerOz, { retailPremiumPct? }) => breakdown
  sriLankaGoldRates,  // (usdPerOz, usdToLkr, { retailPremiumPct? }) => breakdown
} from "@vendorconnect/gold-price";

const gold = await fetchLbmaGoldPrice({ auction: "am" });
```

## Notes

- **Cache it.** The LBMA fixing and the FX rate each change once per day. Fetch after ~16:00 London time, persist, and serve from your own store — do not call these endpoints per request.
- **Weekends / holidays**: no new auction, so `fetchLbmaGoldPrice` returns the last business day's fixing. That is the correct behaviour.
- `sriLanka.*` values with no premium are the **pure metal value**. Real retail prices in Sri Lanka add duty + margin — pass `retailPremiumPct`.
- If LBMA relocates the `prices.lbma.org.uk/json/*.json` files, pass `lbma: { url }` to point at a mirror, or fall back to Nasdaq Data Link's `LBMA/GOLD` dataset (free key).
- All network calls time out after 10s (`timeoutMs` to override) and accept a `fetchImpl` for testing.

## Scripts

| Script | Purpose |
| --- | --- |
| `pnpm build` | Compile to `dist/` |
| `pnpm dev` | `tsc --watch` |
| `pnpm typecheck` | Type-check only |
| `pnpm lint` | ESLint over `src` |
