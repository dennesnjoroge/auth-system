import dotenv from "dotenv";
dotenv.config();
import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import cors from "cors";
import os from "os";
import cookieParser from "cookie-parser";
import db from "./src/config/db.js";
import indexRoutes from "./src/routes/index.js";
import { json } from "stream/consumers";

const app = express();

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

const HOST = process.env.HOST;
const PORT = process.env.PORT;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN;

app.disable("x-powered-by");
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://192.168.88.50:3000", process.env.CLIENT_ORIGIN],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Services are running",
    data: {
      service: "",
      status: "running",
      uptime: process.uptime(),
    },
  });
});

app.use("/api/v1", indexRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    errors: { message: "Route not found" },
  });
});

app.use((error, req, res, next) => {
  return res.status(error.statusCode).json({
    status: "fail",
    message: error.message,
  });
});

const server = app.listen(PORT, HOST, () => {
  const hostIP = process.env.HOST_IP;

  console.log("Server running:");
  console.log(`- IP:   http://${HOST}:${PORT}`);
  console.log(`- Docs:   http://${HOST}:${PORT}/api-docs`);
});

server.on("error", (error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
