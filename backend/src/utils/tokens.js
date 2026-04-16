import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

export function buildAuthPayload(user) {
  return {
    sub: String(user.id),
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
  };
}

export function createAccessToken(user) {
  return jwt.sign(buildAuthPayload(user), env.jwtSecret, {
    expiresIn: env.accessTokenTtl,
    subject: String(user.id),
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

export function createRefreshToken(user) {
  return jwt.sign(buildAuthPayload(user), env.jwtSecret, {
    expiresIn: env.refreshTokenTtl,
    subject: String(user.id),
  });
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwtSecret);
}
