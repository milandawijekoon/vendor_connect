/** Grams in one troy ounce (the unit gold spot prices are quoted in). */
export const TROY_OUNCE_GRAMS = 31.1034768;

/** Fineness of common carat grades, as a fraction of pure (24K) gold. */
export const PURITY = {
  k24: 24 / 24,
  k22: 22 / 24,
  k21: 21 / 24,
  k18: 18 / 24,
  k14: 14 / 24,
} as const;

/**
 * Weight of a Sri Lankan "pawning sovereign" (බ්‍රවුම / pawn ticket unit).
 * Local jewellers and pawn brokers quote 22K gold per 8 g sovereign.
 */
export const LK_SOVEREIGN_GRAMS = 8;
