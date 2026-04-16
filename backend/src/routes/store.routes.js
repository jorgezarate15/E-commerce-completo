import { Router } from "express";

import { Product } from "../models/Product.js";
import { parsePagination } from "../utils/validation.js";

export const storeRouter = Router();

storeRouter.get("/products", async (req, res) => {
  const { page, pageSize, skip } = parsePagination(req.query, {
    page: 1,
    pageSize: 12,
    maxPageSize: 100,
  });

  const [items, total] = await Promise.all([
    Product.find().sort({ id: 1 }).skip(skip).limit(pageSize).lean(),
    Product.countDocuments(),
  ]);

  return res.json({
    items,
    total,
    page,
    page_size: pageSize,
    total_pages: Math.ceil(total / pageSize),
  });
});

storeRouter.get("/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  const item = await Product.findOne({ id }).lean();
  if (!item) {
    return res.status(404).json({ message: "Producto no encontrado" });
  }
  return res.json(item);
});

storeRouter.get("/categories", async (_req, res) => {
  const rows = await Product.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $project: { _id: 0, id: "$_id", count: 1 } },
    { $sort: { id: 1 } },
  ]);

  return res.json({
    items: rows.map((row) => ({
      id: row.id,
      count: row.count,
    })),
  });
});
