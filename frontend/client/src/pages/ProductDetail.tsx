import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  ShoppingCart,
  Heart,
  ArrowLeft,
  Truck,
  Shield,
  RotateCcw,
  ChevronRight,
  Minus,
  Plus,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Layout } from "@/components/Layout";
import { CartDrawer } from "@/components/CartDrawer";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/index";
import { getStoreProductById, getStoreProducts } from "@/api/store";
import { products as fallbackProducts } from "@/data/products";
import { formatPrice, discountPercent, ROUTE_PATHS } from "@/lib/index";
import { useCart } from "@/hooks/useCart";
import { springPresets, staggerContainer, staggerItem } from "@/lib/motion";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(fallbackProducts);
  const [loadedProduct, setLoadedProduct] = useState<Product | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const remoteProducts = await getStoreProducts();
        if (isMounted && remoteProducts.length > 0) {
          setCatalogProducts(remoteProducts);
        }
      } catch {
        // Mantiene fallback local para evitar pantalla vacia.
      }

      const parsedId = Number(id);
      if (!Number.isFinite(parsedId)) {
        return;
      }

      try {
        const remoteProduct = await getStoreProductById(parsedId);
        if (isMounted) {
          setLoadedProduct(remoteProduct);
        }
      } catch {
        // Si falla, usa el producto del fallback local.
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const product = loadedProduct ?? catalogProducts.find((item) => item.id === Number(id));

  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0]);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!product) {
      return;
    }
    setSelectedColor(product.colors?.[0]);
    setSelectedSize(undefined);
    setQuantity(1);
    setActiveImage(0);
  }, [product?.id]);

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Producto no encontrado</h2>
          <Button onClick={() => navigate(ROUTE_PATHS.PRODUCTS)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Volver a la tienda
          </Button>
        </div>
      </Layout>
    );
  }

  const related = catalogProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const images = [product.image, product.image + "&sat=-50", product.image + "&blur=1"];

  const handleAddToCart = () => {
    if (product.sizes && !selectedSize) return;
    addItem(product, { color: selectedColor, size: selectedSize });
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  return (
    <Layout>
      <CartDrawer />
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to={ROUTE_PATHS.HOME} className="hover:text-foreground transition-colors">
            Inicio
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to={ROUTE_PATHS.PRODUCTS} className="hover:text-foreground transition-colors">
            Tienda
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-medium line-clamp-1 max-w-[200px]">
            {product.name}
          </span>
        </nav>

        {/* Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={springPresets.gentle}
            className="space-y-4"
          >
            <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
              <motion.img
                key={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === i ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={springPresets.gentle}
            className="space-y-6"
          >
            {/* Category + Badge */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground capitalize">{product.category}</span>
              {product.badge && (
                <span className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                  {product.badge === "new" ? "Nuevo" : product.badge === "sale" ? "Oferta" : product.badge === "hot" ? "🔥 Popular" : "Últimas unidades"}
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-5 h-5 ${
                      s <= Math.floor(product.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-muted text-muted"
                    }`}
                  />
                ))}
              </div>
              <span className="font-semibold text-foreground">{product.rating}</span>
              <span className="text-muted-foreground text-sm">({product.reviews} reseñas)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <p className="text-4xl font-bold text-foreground">{formatPrice(product.price)}</p>
              {product.originalPrice && (
                <>
                  <p className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </p>
                  <Badge variant="destructive">
                    -{discountPercent(product.originalPrice, product.price)}%
                  </Badge>
                </>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed">{product.description}</p>

            <Separator />

            {/* Colors */}
            {product.colors && (
              <div>
                <p className="text-sm font-semibold text-foreground mb-3">
                  Color:{" "}
                  <span className="font-normal text-muted-foreground capitalize">
                    {selectedColor}
                  </span>
                </p>
                <div className="flex gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor === color
                          ? "border-primary scale-110"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && (
              <div>
                <p className="text-sm font-semibold text-foreground mb-3">
                  Talla: <span className="font-normal text-muted-foreground">{selectedSize || "Seleccionar"}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                        selectedSize === size
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-foreground hover:border-primary"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {product.sizes && !selectedSize && (
                  <p className="text-xs text-destructive mt-2">* Selecciona una talla</p>
                )}
              </div>
            )}

            {/* Quantity + Add to cart */}
            <div className="flex items-center gap-4">
              {/* Quantity */}
              <div className="flex items-center border border-border rounded-xl overflow-hidden">
                <button
                  className="w-10 h-11 flex items-center justify-center hover:bg-muted transition-colors"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button
                  className="w-10 h-11 flex items-center justify-center hover:bg-muted transition-colors"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <motion.div className="flex-1" whileTap={{ scale: 0.97 }}>
                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={product.sizes !== undefined && !selectedSize}
                >
                  <AnimatePresence mode="wait">
                    {addedFeedback ? (
                      <motion.span
                        key="done"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" /> Añadido al Carrito
                      </motion.span>
                    ) : (
                      <motion.span
                        key="add"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" /> Añadir al Carrito
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>

              <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl">
                <Heart className="w-5 h-5" />
              </Button>
            </div>

            {/* Stock */}
            <p className={`text-sm ${product.stock < 10 ? "text-destructive" : "text-emerald-500"}`}>
              {product.stock < 10
                ? `⚠️ ¡Solo quedan ${product.stock} unidades!`
                : `✓ ${product.stock} unidades disponibles`}
            </p>

            {/* Trust */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: Truck, text: "Envío gratis +50€" },
                { icon: Shield, text: "Compra segura" },
                { icon: RotateCcw, text: "30 días devolución" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex flex-col items-center gap-1.5 p-3 bg-muted/50 rounded-xl text-center">
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Features */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-foreground mb-6">Características</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {product.features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...springPresets.gentle, delay: i * 0.04 }}
                className="flex items-start gap-3 p-4 bg-card border border-border rounded-xl"
              >
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 text-primary" />
                </div>
                <p className="text-sm text-foreground">{f}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">Productos Relacionados</h2>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {related.map((p) => (
                <motion.div key={p.id} variants={staggerItem}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </motion.div>
          </section>
        )}
      </div>
    </Layout>
  );
}
