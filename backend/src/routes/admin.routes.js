import { Router } from "express";

import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { escapeRegex, parseDateParam, parsePagination, parseSearchTerm } from "../utils/validation.js";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get("/products", async (req, res) => {
  const { page, pageSize, skip } = parsePagination(req.query);
  const [items, total] = await Promise.all([
    Product.find().sort({ id: 1 }).skip(skip).limit(pageSize).lean(),
    Product.countDocuments(),
  ]);
  const mapped = items.map((item) => ({
    id: item.id,
    name: item.name,
    brand: item.brand,
    category: item.category,
    variants: (item.colors?.length ?? 0) + (item.sizes?.length ?? 0),
    total_stock: item.stock,
  }));
  return res.json({
    items: mapped,
    total,
    page,
    page_size: pageSize,
    total_pages: Math.ceil(total / pageSize),
  });
});

adminRouter.get("/orders", async (req, res) => {
  const { page, pageSize, skip } = parsePagination(req.query);
  const [items, total] = await Promise.all([
    Order.find().sort({ created_at: -1 }).skip(skip).limit(pageSize).lean(),
    Order.countDocuments(),
  ]);
  return res.json({
    items: items.map((item) => ({
      id: item.id,
      user_id: item.user_id,
      customer_email: item.customer_email,
      status: item.status,
      total: item.total,
      created_at: item.created_at,
    })),
    total,
    page,
    page_size: pageSize,
    total_pages: Math.ceil(total / pageSize),
  });
});

adminRouter.patch("/orders/:orderId/status", async (req, res) => {
  const orderId = Number(req.params.orderId);
  const status = String(req.body?.status ?? "");
  const validStatuses = new Set(["pending", "processing", "shipped", "delivered", "cancelled"]);

  if (!validStatuses.has(status)) {
    return res.status(400).json({ message: "Estado invalido" });
  }

  const updated = await Order.findOneAndUpdate(
    { id: orderId },
    { $set: { status } },
    { new: true }
  ).lean();

  if (!updated) {
    return res.status(404).json({ message: "Pedido no encontrado" });
  }

  return res.status(204).send();
});

adminRouter.get("/users", async (req, res) => {
  const { page, pageSize, skip } = parsePagination(req.query);
  const search = parseSearchTerm(req.query.search);
  const safeSearch = escapeRegex(search);
  const query = search
    ? {
        $or: [
          { email: { $regex: safeSearch, $options: "i" } },
          { full_name: { $regex: safeSearch, $options: "i" } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    User.find(query).sort({ id: 1 }).skip(skip).limit(pageSize).lean(),
    User.countDocuments(query),
  ]);

  return res.json({
    items: items.map((item) => ({
      id: item.id,
      email: item.email,
      full_name: item.full_name,
      role: item.role,
      is_active: item.is_active,
    })),
    total,
    page,
    page_size: pageSize,
    total_pages: Math.ceil(total / pageSize),
  });
});

adminRouter.patch("/users/:userId/role", async (req, res) => {
  const userId = Number(req.params.userId);
  const role = String(req.body?.role ?? "");
  const validRoles = new Set(["admin", "customer"]);

  if (!validRoles.has(role)) {
    return res.status(400).json({ message: "Rol invalido" });
  }

  const updated = await User.findOneAndUpdate(
    { id: userId },
    { $set: { role } },
    { new: true }
  ).lean();

  if (!updated) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }

  return res.status(204).send();
});

adminRouter.get("/analytics", async (req, res) => {
  const from = parseDateParam(req.query.from, "from");
  const to = parseDateParam(req.query.to, "to");
  const status = req.query.status ? String(req.query.status) : null;
  const validStatuses = new Set(["pending", "processing", "shipped", "delivered", "cancelled"]);

  if (status && !validStatuses.has(status)) {
    return res.status(400).json({ message: "status invalido" });
  }

  if (from && to && from > to) {
    return res.status(400).json({ message: "El rango de fechas es invalido" });
  }

  const match = {};
  if (from || to) {
    match.created_at = {};
    if (from) {
      match.created_at.$gte = from;
    }
    if (to) {
      const inclusiveEnd = new Date(to);
      inclusiveEnd.setHours(23, 59, 59, 999);
      match.created_at.$lte = inclusiveEnd;
    }
  }
  if (status) {
    match.status = status;
  }

  const orders = await Order.find(match).lean();
  const paidStatuses = new Set(["processing", "shipped", "delivered"]);

  const totalOrders = orders.length;
  const paidOrders = orders.filter((order) => paidStatuses.has(order.status)).length;
  const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);
  const averageOrderValue = totalOrders === 0 ? 0 : totalRevenue / totalOrders;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const ordersToday = orders.filter((order) => new Date(order.created_at) >= today).length;

  const statusMap = new Map();
  for (const order of orders) {
    statusMap.set(order.status, (statusMap.get(order.status) ?? 0) + 1);
  }

  const productMap = new Map();
  for (const order of orders) {
    for (const item of order.items ?? []) {
      const current = productMap.get(item.product_name) ?? { units_sold: 0, revenue: 0 };
      current.units_sold += item.quantity;
      current.revenue += item.quantity * item.unit_price;
      productMap.set(item.product_name, current);
    }
  }

  const dailyMap = new Map();
  for (const order of orders) {
    const day = new Date(order.created_at).toISOString().slice(0, 10);
    const current = dailyMap.get(day) ?? { orders: 0, revenue: 0 };
    current.orders += 1;
    current.revenue += order.total;
    dailyMap.set(day, current);
  }

  return res.json({
    total_orders: totalOrders,
    paid_orders: paidOrders,
    total_revenue: totalRevenue,
    average_order_value: averageOrderValue,
    orders_today: ordersToday,
    status_breakdown: Array.from(statusMap.entries()).map(([statusKey, count]) => ({
      status: statusKey,
      count,
    })),
    top_products: Array.from(productMap.entries())
      .map(([productName, values]) => ({
        product_name: productName,
        units_sold: values.units_sold,
        revenue: values.revenue,
      }))
      .sort((a, b) => b.units_sold - a.units_sold)
      .slice(0, 5),
    daily_series: Array.from(dailyMap.entries())
      .map(([day, values]) => ({
        day,
        orders: values.orders,
        revenue: values.revenue,
      }))
      .sort((a, b) => a.day.localeCompare(b.day)),
  });
});
