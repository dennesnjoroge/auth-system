import dotenv from "dotenv";
dotenv.config();
import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import os from "os";
import cookieParser from "cookie-parser";
import db from "./src/config/db.js";
import corsRouter from "./src/config/cors.js";
import indexRoutes from "./src/routes/index.js";
import { json } from "stream/consumers";
import logger from "./src/utils/logger.js";
import limiter from "./src/limiter/limiter.js";
import deleteUserProfile from "./src/cron/cronjob.js";
deleteUserProfile.start();

const app = express();
app.use(limiter);

// Swagger Doc Config
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Auth System API",
      version: "1.0.0",
      description: "Auth System API documentation",
    },
    servers: [
      {
        url: "http://127.0.0.1:5000",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN;

app.disable("x-powered-by");
app.use(cookieParser());

app.use(corsRouter);

app.use(express.json({ limit: "1mb" }));

app.use("/api/v1", indexRoutes);

app.use((error, req, res, next) => {
  if (error.isAppError) {
    return res.status(error.statusCode).json({
      status: "fail",
      message: error.message,
      errors: error.errors,
    });
  }

  logger.triggerSystemErrorLog(error.message, error, req);

  if (process.env.NODE_ENV === "development") {
    console.error(error);
  }

  return res.status(500).json({
    status: "error",
    message: "Something went completely wrong on our end.",
  });
});

app.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
});
