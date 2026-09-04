export default () => ({
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  port: parseInt(process.env['API_PORT'] ?? '4000', 10),

  database: {
    url: process.env['DATABASE_URL'],
  },

  auth: {
    jwtSecret: process.env['JWT_SECRET'],
    jwtExpiresIn: process.env['JWT_EXPIRES_IN'] ?? '30m',
    googleClientId: process.env['GOOGLE_CLIENT_ID'] ?? '',
  },

  cloudinary: {
    cloudName: process.env['CLOUDINARY_CLOUD_NAME'],
    apiKey: process.env['CLOUDINARY_API_KEY'],
    apiSecret: process.env['CLOUDINARY_API_SECRET'],
  },

  meilisearch: {
    host: process.env['MEILISEARCH_HOST'] ?? 'http://localhost:7700',
    apiKey: process.env['MEILISEARCH_API_KEY'],
  },

  mail: {
    host: process.env['SMTP_HOST'],
    port: parseInt(process.env['SMTP_PORT'] ?? '587', 10),
    user: process.env['SMTP_USER'],
    pass: process.env['SMTP_PASS'],
    from: process.env['SMTP_FROM'] ?? 'noreply@vendorconnect.lk',
  },

  goldPrice: {
    // Cron expression + timezone for the daily fetch. Default: 16:15 on London
    // business days, ~1h after the LBMA PM auction publishes.
    cron: process.env['GOLD_PRICE_CRON'] ?? '15 16 * * 1-5',
    timezone: process.env['GOLD_PRICE_TZ'] ?? 'Europe/London',
    // Retail/jeweller premium (import duty + margin) added on top of metal value.
    // 0 = pure metal value; 0.05 ≈ typical Sri Lanka shop rate.
    retailPremiumPct: parseFloat(process.env['GOLD_PRICE_RETAIL_PREMIUM_PCT'] ?? '0'),
    // Fetch once on boot if the latest snapshot is missing or stale.
    refreshOnBoot: (process.env['GOLD_PRICE_REFRESH_ON_BOOT'] ?? 'true') !== 'false',
  },
});
