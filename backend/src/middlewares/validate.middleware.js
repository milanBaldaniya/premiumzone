import { ApiError } from '../utils/ApiError.js';

/**
 * Validates req[part] against a Zod schema and replaces it with the parsed,
 * coerced value. Usage: validate(createProductSchema) or validate(schema, 'query').
 */
export const validate = (schema, part = 'body') =>
  (req, _res, next) => {
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      const errors = result.error.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      }));
      return next(new ApiError(422, 'Validation failed', { errors }));
    }
    req[part] = result.data;
    next();
  };
