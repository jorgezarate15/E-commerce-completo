import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    full_name: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "customer"], default: "customer" },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

export const User = mongoose.model("User", userSchema);
