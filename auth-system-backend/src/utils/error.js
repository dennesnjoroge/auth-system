export const sendErrorMessage = (res, statusCode, message) => {
  return res.status(400).json({
    success: false,
    message: message,
    status: statusCode,
    errors: { message },
  });
};
