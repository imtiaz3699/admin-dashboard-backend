export const apiErrorResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({ message });
};

export const apiSuccessResponse = (res, statusCode, message, data) => {
  return res.status(statusCode).json({ message, data,status:statusCode });
};
