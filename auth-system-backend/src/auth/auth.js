import jwt from "jsonwebtoken";
export const auth = (req, res, next) => {
  const token = req.cookies.loginToken;
  console.log(req.cookies || "Token not found!");

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
      status: 401,
      errors: {
        message: "Unauthorized",
      },
    });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      success: false,
      message: "Server configuration error",
      status: 500,
      error: {
        message: "Server configuration error",
      },
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
