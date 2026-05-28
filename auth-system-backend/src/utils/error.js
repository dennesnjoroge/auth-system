export const sendErrorMessage = (res, statusCode, message) => {
  return res.status(400).json({
    success: false,
    message: message,
    status: statusCode,
    errors: { message },
  });
};

export const createAppError = (message, statusCode) => {
  const error = new Error(message);
  error.status = statusCode;
  error.isAppError = true;
  return error;
};
