import { HttpError } from '../utils/errors.js';

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found.',
  });
};

export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.message,
    });
  }

  if (error.code === '23505') {
    return res.status(409).json({
      success: false,
      error: 'Resource already exists.',
    });
  }

  console.error('Unhandled error:', error);

  return res.status(500).json({
    success: false,
    error: 'Internal server error.',
  });
};
