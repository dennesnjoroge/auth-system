export const sendErrorMessage = (res, statusCode, message) => {
  return res.status(400).json({
    success: false,
    message: message,
    status: statusCode,
    errors: { message },
  });
};

export const throwErrorMessage = (message, statusCode) => {
  const error = new Error(message);
  error.status = statusCode;
  throw error;
};
