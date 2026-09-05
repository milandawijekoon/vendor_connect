import * as Joi from 'joi';

/**
 * Known weak / placeholder JWT secrets that must never reach a running server.
 * The first entry is the value shipped in `.env.example`; the rest are common
 * copy-paste defaults. Matching is case-insensitive and ignores wrapping quotes.
 */
const FORBIDDEN_JWT_SECRETS = new Set([
  'change-me-in-production-min-32-chars',
  'change-me',
  'changeme',
  'secret',
  'jwt-secret',
  'your-secret-key',
  'your-256-bit-secret',
]);

/**
 * `Joi.string().min(32)` happily accepts the shipped placeholder (35 chars), which
 * would leave the HS256 signing key publicly known and let anyone forge an ADMIN
 * token. Fail closed on placeholder / low-entropy values and require a longer
 * secret in production.
 */
const jwtSecretSchema = Joi.string()
  .min(32)
  .required()
  .custom((value: string, helpers) => {
    const normalized = value.trim().replace(/^["']|["']$/g, '');
    if (FORBIDDEN_JWT_SECRETS.has(normalized.toLowerCase())) {
      return helpers.message({
        custom:
          'JWT_SECRET is set to a known placeholder value. Generate a strong secret, e.g. `openssl rand -base64 48`.',
      });
    }
    if (new Set(normalized).size < 12) {
      return helpers.message({
        custom: 'JWT_SECRET has insufficient entropy (too few distinct characters).',
      });
    }
    return value;
  }, 'jwt-secret-strength')
  .when('NODE_ENV', { is: 'production', then: Joi.string().min(48) });

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  API_PORT: Joi.number().default(4000),

  DATABASE_URL: Joi.string().uri().required(),

  JWT_SECRET: jwtSecretSchema,
  JWT_EXPIRES_IN: Joi.string().default('30m'),

  GOOGLE_CLIENT_ID: Joi.string().optional().allow(''),

  CLOUDINARY_CLOUD_NAME: Joi.string().optional().allow(''),
  CLOUDINARY_API_KEY: Joi.string().optional().allow(''),
  CLOUDINARY_API_SECRET: Joi.string().optional().allow(''),
  CLOUDINARY_FOLDER: Joi.string().optional().allow(''),

  MEILISEARCH_HOST: Joi.string().uri().default('http://localhost:7700'),
  MEILISEARCH_API_KEY: Joi.string().optional().allow(''),

  SMTP_HOST: Joi.string().optional().allow(''),
  SMTP_PORT: Joi.number().default(587),
  SMTP_USER: Joi.string().optional().allow(''),
  SMTP_PASS: Joi.string().optional().allow(''),
  SMTP_FROM: Joi.string().default('noreply@vendorslk.com'),

  GOLD_PRICE_CRON: Joi.string().default('15 16 * * 1-5'),
  GOLD_PRICE_TZ: Joi.string().default('Europe/London'),
  GOLD_PRICE_RETAIL_PREMIUM_PCT: Joi.number().min(0).max(1).default(0),
  GOLD_PRICE_REFRESH_ON_BOOT: Joi.boolean().truthy('true').falsy('false').default(true),
});
