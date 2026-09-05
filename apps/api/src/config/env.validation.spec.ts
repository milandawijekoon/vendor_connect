import { validationSchema } from './env.validation';

const base = {
  NODE_ENV: 'production',
  DATABASE_URL: 'mysql://user:pass@localhost:3306/db',
  JWT_SECRET: 'k7Yq2wZ1pX9sL4vB8nR6tD3fH5jC0mA-uE2iO4yG7bQ9wS1xT',
};

const validate = (env: Record<string, unknown>) =>
  validationSchema.validate(env, { abortEarly: false });

describe('env validationSchema — JWT_SECRET', () => {
  it('accepts a strong secret in production', () => {
    const { error } = validate(base);
    expect(error).toBeUndefined();
  });

  it('rejects the shipped placeholder even though it is 35 chars', () => {
    const { error } = validate({ ...base, JWT_SECRET: 'change-me-in-production-min-32-chars' });
    expect(error?.message).toMatch(/placeholder/i);
  });

  it('rejects the placeholder regardless of casing or wrapping quotes', () => {
    const { error } = validate({ ...base, JWT_SECRET: '"CHANGE-ME-IN-PRODUCTION-MIN-32-CHARS"' });
    expect(error?.message).toMatch(/placeholder/i);
  });

  it('rejects a low-entropy secret', () => {
    const { error } = validate({ ...base, JWT_SECRET: 'a'.repeat(60) });
    expect(error?.message).toMatch(/entropy/i);
  });

  it('requires at least 48 chars in production', () => {
    const { error } = validate({ ...base, JWT_SECRET: 'k7Yq2wZ1pX9sL4vB8nR6tD3fH5jC0mA-uE2iO4y' });
    expect(error).toBeDefined();
    expect(error?.message).toMatch(/length must be at least 48/i);
  });

  it('allows a 32-char strong secret outside production', () => {
    const { error } = validate({
      ...base,
      NODE_ENV: 'development',
      JWT_SECRET: 'k7Yq2wZ1pX9sL4vB8nR6tD3fH5jC0mA1',
    });
    expect(error).toBeUndefined();
  });
});
