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

export default { profile };
