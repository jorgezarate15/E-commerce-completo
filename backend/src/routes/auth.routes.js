import { Router } from "express";
import bcrypt from "bcryptjs";

import { User } from "../models/User.js";
import { createAccessToken, createRefreshToken, verifyRefreshToken } from "../utils/tokens.js";

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ message: "Email y password son requeridos" });
  }

  const user = await User.findOne({ email }).lean();
  if (!user || !user.is_active) {
    return res.status(401).json({ message: "Credenciales invalidas" });
  }

  const isValidPassword = await bcrypt.compare(String(password), user.password);
  if (!isValidPassword) {
    return res.status(401).json({ message: "Credenciales invalidas" });
  }

  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  return res.json({
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    },
    tokens: {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: "bearer",
    },
  });
});

authRouter.post("/refresh", async (req, res) => {
  const refreshToken = String(req.body?.refresh_token ?? "");
  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token requerido" });
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    const userId = Number(payload.id ?? payload.sub);
    if (!Number.isFinite(userId)) {
      return res.status(401).json({ message: "Refresh token invalido o expirado" });
    }

    const user = await User.findOne({ id: userId }).lean();
    if (!user || !user.is_active) {
      return res.status(401).json({ message: "Usuario no autorizado" });
    }

    return res.json({
      tokens: {
        access_token: createAccessToken(user),
        refresh_token: createRefreshToken(user),
        token_type: "bearer",
      },
    });
  } catch {
    return res.status(401).json({ message: "Refresh token invalido o expirado" });
  }
});
