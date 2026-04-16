import { User } from "../models/User.js";
import { verifyAccessToken } from "../utils/tokens.js";

function extractToken(headerValue = "") {
  if (!headerValue.startsWith("Bearer ")) {
    return null;
  }
  return headerValue.slice(7);
}

export async function requireAuth(req, res, next) {
  const token = extractToken(req.headers.authorization);
  if (!token) {
    return res.status(401).json({ message: "Token no provisto" });
  }

  try {
    const payload = verifyAccessToken(token);
    const userId = Number(payload.id ?? payload.sub);
    if (!Number.isFinite(userId)) {
      return res.status(401).json({ message: "Token invalido o expirado" });
    }

    const user = await User.findOne({ id: userId }).lean();
    if (!user || !user.is_active) {
      return res.status(401).json({ message: "Usuario no autorizado" });
    }

    req.user = {
      sub: String(user.id),
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    };
    return next();
  } catch {
    return res.status(401).json({ message: "Token invalido o expirado" });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Acceso denegado" });
  }
  return next();
}
