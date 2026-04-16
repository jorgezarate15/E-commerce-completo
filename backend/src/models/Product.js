import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true, index: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    image: { type: String, required: true },
    rating: { type: Number, required: true, default: 4.5 },
    reviews: { type: Number, required: true, default: 0 },
    badge: { type: String, enum: ["new", "sale", "hot", "limited"], default: undefined },
    description: { type: String, required: true },
    features: { type: [String], default: [] },
    stock: { type: Number, required: true, default: 0 },
    colors: { type: [String], default: [] },
    sizes: { type: [String], default: [] },
  },
  { timestamps: true, versionKey: false }
);

export const Product = mongoose.model("Product", productSchema);
