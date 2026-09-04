import {
  LK_SOVEREIGN_GRAMS,
  PURITY,
  TROY_OUNCE_GRAMS,
} from "./constants";
import { fetchLbmaGoldPrice, type FetchLbmaOptions, type LbmaGoldPrice } from "./lbma";
import { fetchUsdRate, type FetchFxOptions } from "./fx";

export type GoldRateBreakdown = {
  perOz: number;
  perGram24k: number;
  perGram22k: number;
  perGram18k: number;
};

export type SriLankaGoldRates = GoldRateBreakdown & {
  /** 22K gold value of one 8 g pawning sovereign. */
  perSovereign22k: number;
};

/**
 * Multiplier applied on top of the pure-metal value to approximate the
 * Sri Lankan retail/jeweller rate (import duty + margin). `0` = pure metal.
 * Local shop prices historically sit ~3-8% above metal value.
 */
export type PremiumOptions = { retailPremiumPct?: number };

function breakdown(perOz: number, premium: number): GoldRateBreakdown {
  const factor = 1 + premium;
  const perGram24k = (perOz / TROY_OUNCE_GRAMS) * factor;
  return {
    perOz: perOz * factor,
    perGram24k,
    perGram22k: perGram24k * PURITY.k22,
    perGram18k: perGram24k * PURITY.k18,
  };
}

/** Convert an LBMA USD/oz price into USD-denominated per-gram/per-carat values. */
export function worldGoldRates(
  usdPerOz: number,
  options: PremiumOptions = {},
): GoldRateBreakdown {
  return breakdown(usdPerOz, options.retailPremiumPct ?? 0);
}

/** Convert an LBMA USD/oz price + a USD->LKR rate into Sri Lankan rupee values. */
export function sriLankaGoldRates(
  usdPerOz: number,
  usdToLkr: number,
  options: PremiumOptions = {},
): SriLankaGoldRates {
  const b = breakdown(usdPerOz * usdToLkr, options.retailPremiumPct ?? 0);
  return { ...b, perSovereign22k: b.perGram22k * LK_SOVEREIGN_GRAMS };
}

export type DailyGoldSnapshot = {
  /** LBMA auction date (`YYYY-MM-DD`). */
  date: string;
  source: "LBMA";
  auction: LbmaGoldPrice["auction"];
  usdPerOz: number;
  usdToLkr: number;
  world: GoldRateBreakdown;
  sriLanka: SriLankaGoldRates;
  fetchedAt: string;
};

export type DailyGoldSnapshotOptions = PremiumOptions & {
  lbma?: FetchLbmaOptions;
  fx?: FetchFxOptions;
};

/**
 * One call for a full daily snapshot: LBMA fixing + USD->LKR + derived world
 * and Sri Lanka rates. Cache the result — the inputs only change once per day.
 */
export async function fetchDailyGoldSnapshot(
  options: DailyGoldSnapshotOptions = {},
): Promise<DailyGoldSnapshot> {
  const [gold, fx] = await Promise.all([
    fetchLbmaGoldPrice(options.lbma),
    fetchUsdRate({ quote: "LKR", ...options.fx }),
  ]);

  const premium: PremiumOptions = {};
  if (options.retailPremiumPct !== undefined) {
    premium.retailPremiumPct = options.retailPremiumPct;
  }

  return {
    date: gold.date,
    source: "LBMA",
    auction: gold.auction,
    usdPerOz: gold.usdPerOz,
    usdToLkr: fx.rate,
    world: worldGoldRates(gold.usdPerOz, premium),
    sriLanka: sriLankaGoldRates(gold.usdPerOz, fx.rate, premium),
    fetchedAt: new Date().toISOString(),
  };
}
