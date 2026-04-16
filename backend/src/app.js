import cors from "cors";
import express from "express";
import morgan from "morgan";

import { env } from "./config/env.js";
import { adminRouter } from "./routes/admin.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { seedRouter } from "./routes/seed.routes.js";
import { storeRouter } from "./routes/store.routes.js";

export const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origen no permitido"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/seed", seedRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1", storeRouter);

app.use((err, _req, res, _next) => {
  const status = Number(err?.status ?? 500);
  res.status(status).json({ message: err.message ?? "Internal Server Error" });
});
