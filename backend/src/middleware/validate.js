import { AppError } from '../utils/appError.js';

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query
  });

  if (!result.success) {
    const message = result.error.issues.map((issue) => issue.message).join(', ');
    return next(new AppError(message, 400));
  }

  req.validated = result.data;
  next();
};
