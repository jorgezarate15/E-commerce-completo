import { Router } from "express";

import { env } from "../config/env.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { seedDatabase } from "../services/seedData.js";

export const seedRouter = Router();

seedRouter.post("/dev-seed", requireAuth, requireAdmin, async (_req, res) => {
  if (env.nodeEnv !== "development") {
    return res.status(403).json({ message: "Endpoint solo disponible en development" });
  }

  await seedDatabase();
  return res.json({ status: "ok" });
});

seedRouter.post("/bootstrap", async (req, res) => {
  if (env.nodeEnv !== "development") {
    return res.status(403).json({ message: "Endpoint solo disponible en development" });
  }

  if (!env.seedBootstrapKey) {
    return res.status(500).json({ message: "SEED_BOOTSTRAP_KEY no configurada" });
  }

  const requestKey = String(req.headers["x-seed-key"] ?? "");
  if (!requestKey || requestKey !== env.seedBootstrapKey) {
    return res.status(401).json({ message: "Clave de bootstrap invalida" });
  }

  const [usersCount, productsCount, ordersCount] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments(),
  ]);

  if (usersCount > 0 || productsCount > 0 || ordersCount > 0) {
    return res.status(409).json({
      message: "Bootstrap disponible solo con base vacia",
      counts: {
        users: usersCount,
        products: productsCount,
        orders: ordersCount,
      },
    });
  }

  await seedDatabase();
  return res.status(201).json({ status: "ok" });
});
