import jwt from "jsonwebtoken";

export const signAccessToken = (id, email) => {
  return jwt.sign({ sub: id, email: email }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};
