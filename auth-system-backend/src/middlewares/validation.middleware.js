import { ZodError } from "zod";
import utils from "../utils/utils.js";

const login = (loginSchema) => {
  return (req, res, next) => {
    try {
      const validloginData = loginSchema.parse(req.body);
      req.body = validloginData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.reduce((acc, issue) => {
          const field = issue.path.join(".");
          acc[field] = issue.message;
          return acc;
        }, {});

        return next(utils.appError("Validation failed", 400, errors));
      }

      next(error);
    }
  };
};

const register = (registrationSchema) => {
  return (req, res, next) => {
    try {
      const validRegistrationData = registrationSchema.parse(req.body);
      req.body = validRegistrationData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.reduce((acc, issue) => {
          const field = issue.path.join(".");
          acc[field] = issue.message;
          return acc;
        }, {});

        return next(utils.appError("Validation failed", 400, errors));
      }

      next(error);
    }
  };
};

const verifyEmail = (verifyEmailSchema) => {
  return (req, res, next) => {
    try {
      const verificationToken = verifyEmailSchema.parse(req.body);
      req.body = verificationToken;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.reduce((acc, issue) => {
          const field = issue.path.join(".");
          acc[field] = issue.message;
          return acc;
        }, {});

        return next(utils.appError("Validation failed", 400, errors));
      }

      next(error);
    }
  };
};

const forgotPassword = (forgotPasswordSchema) => {
  return (req, res, next) => {
    try {
      const emailAddress = forgotPasswordSchema.parse(req.body);
      req.body = emailAddress;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.reduce((acc, issue) => {
          const field = issue.path.join(".");
          acc[field] = issue.message;
          return acc;
        }, {});

        return next(utils.appError("Validation failed", 400, errors));
      }

      next(error);
    }
  };
};

const resetPassword = (resetPasswordSchema) => {
  return (req, res, next) => {
    try {
      const validData = resetPasswordSchema.parse(req.body);
      req.body = validData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.reduce((acc, issue) => {
          const field = issue.path.join(".");
          acc[field] = issue.message;
          return acc;
        }, {});

        return next(utils.appError("Validation failed", 400, errors));
      }

      next(error);
    }
  };
};

export default { login, register, verifyEmail, forgotPassword, resetPassword };
