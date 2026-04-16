import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 8000),
  mongodbUri: process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/ecommerce_db",
  jwtSecret: process.env.JWT_SECRET ?? "dev-super-secret",
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL ?? "15m",
  refreshTokenTtl: process.env.REFRESH_TOKEN_TTL ?? "7d",
  seedBootstrapKey: process.env.SEED_BOOTSTRAP_KEY ?? "",
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? "http://localhost:8080,http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};
