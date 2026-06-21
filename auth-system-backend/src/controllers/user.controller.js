import userService from "../services/user.service.js";

const profile = async (req, res, next) => {
  try {
    const { userId } = req.user;

    const userProfile = await userService.profile(userId);

    res.status(200).json({
      payload: userProfile,
    });
  } catch (error) {
    next(error);
  }
};

const settings = async (req, res, next) => {
  try {
    const { userId } = req.user;

    const history = await userService.settings(userId);

    res.status(200).json({
      status: "success",
      payload: history,
    });
  } catch (error) {
    next(error);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    const { userId } = req.user;
    await userService.deleteAccount(userId, req);

    /*
    res.clearCookie("_at", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.clearCookie("_rt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    */

    res.status(200).json({
      status: "success",
      message: "Account deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export default { profile, settings, deleteAccount };
