export const sendSuccessMessage = (res, statusCode, message) => {
  return res.status(statusCode).json({
    success: true,
    message: message,
    status: statusCode,
    data: { message },
  });
};
