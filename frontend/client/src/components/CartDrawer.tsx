import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";
import { formatPrice, ROUTE_PATHS } from "@/lib/index";
import { springPresets } from "@/lib/motion";

export function CartDrawer() {
  const { isOpen, closeCart, items, removeItem, updateQuantity, total, clearCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    closeCart();
    navigate(ROUTE_PATHS.CHECKOUT);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={springPresets.gentle}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-background border-l border-border z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-foreground">
                  Mi Carrito
                  {items.length > 0 && (
                    <span className="ml-2 text-sm text-muted-foreground font-normal">
                      ({items.length} {items.length === 1 ? "producto" : "productos"})
                    </span>
                  )}
                </h2>
              </div>
              <Button variant="ghost" size="icon" onClick={closeCart}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full text-center gap-4"
                >
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Tu carrito está vacío</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      ¡Explora nuestra tienda y encuentra algo que te guste!
                    </p>
                  </div>
                  <Button onClick={() => { closeCart(); navigate(ROUTE_PATHS.PRODUCTS); }}>
                    Ver Productos
                  </Button>
                </motion.div>
              ) : (
                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <motion.div
                      key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0 }}
                      transition={springPresets.snappy}
                      className="flex gap-3 bg-muted/50 rounded-xl p-3"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug">
                          {item.product.name}
                        </p>
                        {item.selectedSize && (
                          <p className="text-xs text-muted-foreground mt-0.5">Talla: {item.selectedSize}</p>
                        )}
                        <p className="text-sm font-bold text-primary mt-1">
                          {formatPrice(item.product.price)}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          {/* Quantity */}
                          <div className="flex items-center gap-1 bg-background border border-border rounded-lg overflow-hidden">
                            <button
                              className="w-7 h-7 flex items-center justify-center hover:bg-muted transition-colors"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-7 text-center text-sm font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              className="w-7 h-7 flex items-center justify-center hover:bg-muted transition-colors"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border px-5 py-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-bold text-lg text-foreground">{formatPrice(total())}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Envío y descuentos calculados al finalizar
                </p>
                <Button className="w-full gap-2" size="lg" onClick={handleCheckout}>
                  Finalizar Compra
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-destructive hover:text-destructive"
                  size="sm"
                  onClick={clearCart}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Vaciar carrito
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
