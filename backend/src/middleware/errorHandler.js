export function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    console.error(err);
  }

  res.status(statusCode).json({
    status: err.status || 'error',
    message: err.isOperational || statusCode < 500 ? err.message : 'Something went wrong',
    ...(isProduction ? {} : { stack: err.stack })
  });
}
