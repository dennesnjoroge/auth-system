// auth middleware
import jwt from "jsonwebtoken";
import utils from "../utils/utils.js";

const auth = (req, res, next) => {
  try {
    // destructure access token
    const { _at: authToken } = req.cookies;

    if (!authToken) {
      throw utils.appError("Unauthorized", 401);
    }

    // decode auth token
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    const userId = decoded.sub;
    const userEmail = decoded.email;
    req.user = { userId, userEmail };
    next();
  } catch (error) {
    next(error);
  }
};

const refresh = (req, res, next) => {
  try {
    // get refresh token
    const { _rt: refreshToken } = req.cookies || {};

    if (!refreshToken) {
      throw utils.appError("Unauthorized", 401);
    }

    // decode token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    const userId = decoded.sub;

    //pass user id to controller
    req.user = { userId, refreshToken };
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw utils.appError(
        "Session expired or invalid. Please log in again.",
        401,
      );
    }
    next(error);
  }
};

export default { auth, refresh };
