import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ShoppingCart, Star, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/index";
import { formatPrice, discountPercent, productDetailPath } from "@/lib/index";
import { useCart } from "@/hooks/useCart";
import { hoverLift, springPresets } from "@/lib/motion";

const badgeConfig = {
  new: { label: "Nuevo", className: "bg-emerald-500 text-white" },
  sale: { label: "Oferta", className: "bg-destructive text-destructive-foreground" },
  hot: { label: "🔥 Popular", className: "bg-amber-500 text-white" },
  limited: { label: "Últimas unidades", className: "bg-accent text-accent-foreground" },
};

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCart();

  return (
    <motion.div
      variants={hoverLift}
      initial="rest"
      whileHover="hover"
      className="group bg-card border border-border rounded-2xl overflow-hidden flex flex-col"
      style={{
        boxShadow: "0 2px 12px -4px color-mix(in srgb, var(--primary) 8%, transparent)",
      }}
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-square bg-muted">
        <Link to={productDetailPath(product.id)}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${badgeConfig[product.badge].className}`}
            >
              {badgeConfig[product.badge].label}
            </span>
          </div>
        )}

        {/* Wishlist */}
        <button className="absolute top-3 right-3 w-8 h-8 bg-background/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-primary-foreground">
          <Heart className="w-4 h-4" />
        </button>

        {/* Discount */}
        {product.originalPrice && (
          <div className="absolute bottom-3 left-3 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-full">
            -{discountPercent(product.originalPrice, product.price)}%
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <div>
          <p className="text-xs text-muted-foreground capitalize mb-1">{product.category}</p>
          <Link to={productDetailPath(product.id)}>
            <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2 hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-3.5 h-3.5 ${
                  s <= Math.floor(product.rating)
                    ? "fill-amber-400 text-amber-400"
                    : "fill-muted text-muted"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({product.reviews})</span>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <div>
            <p className="font-bold text-lg text-foreground">{formatPrice(product.price)}</p>
            {product.originalPrice && (
              <p className="text-xs text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </p>
            )}
          </div>
          <motion.div whileTap={{ scale: 0.9 }} transition={springPresets.snappy}>
            <Button
              size="sm"
              className="rounded-xl"
              onClick={() => addItem(product)}
            >
              <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
              Añadir
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
