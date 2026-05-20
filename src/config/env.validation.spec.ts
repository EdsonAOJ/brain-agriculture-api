import { envValidationSchema } from './env.validation';

describe('envValidationSchema', () => {
  it('should validate required environment variables', () => {
    const result = envValidationSchema.validate({
      NODE_ENV: 'test',
      PORT: 3333,
      DATABASE_URL: 'postgresql://brain:brain@localhost:5432/db',
    });

    expect(result.error).toBeUndefined();
    expect(result.value).toEqual({
      NODE_ENV: 'test',
      PORT: 3333,
      DATABASE_URL: 'postgresql://brain:brain@localhost:5432/db',
    });
  });

  it('should apply default values', () => {
    const result = envValidationSchema.validate({
      DATABASE_URL: 'postgresql://brain:brain@localhost:5432/db',
    });

    expect(result.error).toBeUndefined();
    expect(result.value).toEqual({
      NODE_ENV: 'development',
      PORT: 3333,
      DATABASE_URL: 'postgresql://brain:brain@localhost:5432/db',
    });
  });

  it('should reject missing DATABASE_URL', () => {
    const result = envValidationSchema.validate({
      NODE_ENV: 'test',
      PORT: 3333,
    });

    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain('"DATABASE_URL" is required');
  });

  it('should reject invalid NODE_ENV', () => {
    const result = envValidationSchema.validate({
      NODE_ENV: 'invalid',
      PORT: 3333,
      DATABASE_URL: 'postgresql://brain:brain@localhost:5432/db',
    });

    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain(
      '"NODE_ENV" must be one of [development, test, production]',
    );
  });
});
