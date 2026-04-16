import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Zap,
  Tag,
  TrendingUp,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { CartDrawer } from "@/components/CartDrawer";
import { ProductCard } from "@/components/ProductCard";
import type { Category, Product } from "@/lib/index";
import { ROUTE_PATHS } from "@/lib/index";
import { getStoreCategoryCounts, getStoreProducts } from "@/api/store";
import {
  products as fallbackProducts,
  categories as fallbackCategories,
} from "@/data/products";
import {
  springPresets,
  staggerContainer,
  staggerItem,
  fadeInUp,
} from "@/lib/motion";

export default function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);

  useEffect(() => {
    let isMounted = true;

    async function loadCatalog() {
      try {
        const [remoteProducts, categoryCounts] = await Promise.all([
          getStoreProducts(),
          getStoreCategoryCounts(),
        ]);

        if (!isMounted || remoteProducts.length === 0) {
          return;
        }

        setProducts(remoteProducts);

        const metadata = new Map(fallbackCategories.map((item) => [item.id, item]));
        const mergedCategories = categoryCounts.map((item) => {
          const fallback = metadata.get(item.id);
          return {
            id: item.id,
            name: fallback?.name ?? item.id,
            icon: fallback?.icon ?? "🛍️",
            count: item.count,
          };
        });
        setCategories(mergedCategories);
      } catch {
        // Mantiene fallback local si el backend no esta disponible.
      }
    }

    loadCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  const featuredProducts = useMemo(
    () => products.filter((p) => p.badge === "hot" || p.badge === "new"),
    [products]
  );

  const saleProducts = useMemo(() => products.filter((p) => p.badge === "sale"), [products]);

  return (
    <Layout>
      <CartDrawer />

      {/* HERO */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden bg-gradient-to-br from-background via-primary/5 to-accent/10">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/8 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        </div>

        <div className="container mx-auto px-4 py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springPresets.gentle}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium">
              <Zap className="w-4 h-4" />
              Nuevas ofertas esta semana
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight text-foreground">
              Descubre el{" "}
              <span className="text-primary">futuro</span>{" "}
              del shopping
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg">
              Electrónica, moda, accesorios y más — todo en un solo lugar. Calidad premium, precios justos y envío rápido.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="gap-2 rounded-xl text-base px-8"
                onClick={() => navigate(ROUTE_PATHS.PRODUCTS)}
              >
                Explorar Tienda
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-xl text-base px-8"
                onClick={() => navigate(ROUTE_PATHS.PRODUCTS + "?category=sale")}
              >
                <Tag className="w-4 h-4 mr-2" />
                Ver Ofertas
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-4">
              {[
                { value: "10K+", label: "Clientes felices" },
                { value: "500+", label: "Productos" },
                { value: "4.9★", label: "Valoración media" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Hero Image Grid */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...springPresets.gentle, delay: 0.1 }}
            className="hidden lg:grid grid-cols-2 gap-4 h-[500px]"
          >
                {products.slice(0, 4).map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springPresets.gentle, delay: 0.1 + i * 0.05 }}
                className={`relative rounded-2xl overflow-hidden cursor-pointer ${i === 0 ? "row-span-1" : ""}`}
                onClick={() => navigate(`/products/${product.id}`)}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-white text-sm font-semibold line-clamp-1">{product.name}</p>
                  <p className="text-white/80 text-xs">{product.price.toFixed(2)} €</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={springPresets.gentle}
          className="text-center mb-10"
        >
          <h2 className="text-3xl font-bold text-foreground mb-2">Explora por Categoría</h2>
          <p className="text-muted-foreground">Encuentra exactamente lo que buscas</p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {categories.map((cat) => (
            <motion.div key={cat.id} variants={staggerItem}>
              <Link
                to={`${ROUTE_PATHS.PRODUCTS}?category=${cat.id}`}
                className="flex flex-col items-center gap-3 p-4 bg-card border border-border rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 group"
              >
                <span className="text-3xl">{cat.icon}</span>
                <div className="text-center">
                  <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                    {cat.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{cat.count} items</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={springPresets.gentle}
          className="flex items-end justify-between mb-8"
        >
          <div>
            <div className="flex items-center gap-2 text-primary text-sm font-medium mb-1">
              <TrendingUp className="w-4 h-4" />
              Tendencias
            </div>
            <h2 className="text-3xl font-bold text-foreground">Productos Destacados</h2>
          </div>
          <Button variant="ghost" className="gap-1" onClick={() => navigate(ROUTE_PATHS.PRODUCTS)}>
            Ver todos <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {featuredProducts.map((product, i) => (
            <motion.div key={product.id} variants={staggerItem}>
              <ProductCard product={product} index={i} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* SALE BANNER */}
      <section className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={springPresets.gentle}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary to-accent p-8 md:p-12 text-primary-foreground"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-4 w-40 h-40 rounded-full bg-white blur-2xl" />
            <div className="absolute bottom-4 left-1/3 w-60 h-60 rounded-full bg-white blur-3xl" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-sm font-medium opacity-80 mb-2">⚡ Oferta Flash</p>
              <h3 className="text-3xl md:text-4xl font-bold mb-2">
                Hasta 30% de descuento
              </h3>
              <p className="opacity-80 max-w-md">
                En los mejores productos de electrónica, moda y accesorios. Oferta válida hasta agotar stock.
              </p>
            </div>
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 rounded-xl font-bold px-8 flex-shrink-0"
              onClick={() => navigate(ROUTE_PATHS.PRODUCTS + "?category=sale")}
            >
              Ver Ofertas
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      </section>

      {/* ON SALE PRODUCTS */}
      <section className="container mx-auto px-4 py-8 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={springPresets.gentle}
          className="flex items-end justify-between mb-8"
        >
          <div>
            <div className="flex items-center gap-2 text-destructive text-sm font-medium mb-1">
              <Tag className="w-4 h-4" />
              Descuentos
            </div>
            <h2 className="text-3xl font-bold text-foreground">En Oferta Ahora</h2>
          </div>
          <Button variant="ghost" className="gap-1" onClick={() => navigate(ROUTE_PATHS.PRODUCTS)}>
            Ver todos <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {saleProducts.map((product, i) => (
            <motion.div key={product.id} variants={staggerItem}>
              <ProductCard product={product} index={i} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* NEWSLETTER */}
      <section className="container mx-auto px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={springPresets.gentle}
          className="bg-card border border-border rounded-3xl p-8 md:p-12 text-center"
        >
          <Star className="w-10 h-10 text-primary mx-auto mb-4" />
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Suscríbete y ahorra 10%
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Recibe las últimas novedades, ofertas exclusivas y códigos de descuento directamente en tu email.
          </p>
          <form
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="tu@email.com"
              className="flex-1 px-4 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
            />
            <Button type="submit" className="rounded-xl px-6">
              Suscribirse
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-3">Sin spam. Cancela cuando quieras.</p>
        </motion.div>
      </section>
    </Layout>
  );
}
