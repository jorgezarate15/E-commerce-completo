import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product_id: { type: Number, required: true },
    product_name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unit_price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    user_id: { type: Number, required: true, index: true },
    customer_email: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },
    total: { type: Number, required: true, min: 0 },
    created_at: { type: Date, required: true, default: Date.now, index: true },
    items: { type: [orderItemSchema], default: [] },
  },
  { timestamps: true, versionKey: false }
);

export const Order = mongoose.model("Order", orderSchema);
