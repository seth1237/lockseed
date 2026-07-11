export function errorHandler(err, _req, res, _next) {
  let status = err.status || 500;
  let message = err.message || 'Internal server error';

  if (err.name === 'ZodError') {
    status = 400;
    message = err.issues?.[0]?.message || 'Invalid input';
  } else if (err.name === 'ValidationError') {
    status = 400;
  } else if (
    err.name === 'MongoServerSelectionError' ||
    err.name === 'MongooseServerSelectionError' ||
    message.includes('MongoDB connection failed') ||
    message.includes('ETIMEDOUT')
  ) {
    status = 503;
    message = 'Database unavailable. Check MongoDB connection and Atlas IP whitelist.';
  }

  if (status >= 500) {
    console.error('[error]', err);
  }

  res.status(status).json({ error: message });
}

export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
