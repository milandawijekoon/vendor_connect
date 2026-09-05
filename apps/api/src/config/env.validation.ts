import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  API_PORT: Joi.number().default(4000),

  DATABASE_URL: Joi.string().uri().required(),

  JWT_SECRET: Joi.string().min(32).required(),
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
