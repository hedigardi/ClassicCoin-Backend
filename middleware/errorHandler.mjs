import ErrorResponse from '../models/ErrorResponseModel.mjs';

export const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;

  if (err.code === 11000) {
    const message = `The resource already exists`;
    error = new ErrorResponse(message, 400);
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((value) => value.message);
    error = new ErrorResponse(`Missing information: ${message}`, 400);
  }

  if (err.name === 'CastError') {
    const message = `The resource with id: ${err.value} could not be found.`;
    error = new ErrorResponse(message, 404);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    statusCode: error.statusCode || 500,
    error: error.message || 'Server Error',
  });
};
