// password utility functions
export const passwordRegex = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;
  return passwordRegex.test(password);
};
