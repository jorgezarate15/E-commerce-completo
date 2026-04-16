import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  SlidersHorizontal,
  Search,
  X,
  ChevronDown,
  LayoutGrid,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Layout } from "@/components/Layout";
import { CartDrawer } from "@/components/CartDrawer";
import { ProductCard } from "@/components/ProductCard";
import { getStoreCategoryCounts, getStoreProducts } from "@/api/store";
import { products as fallbackProducts, categories as fallbackCategories } from "@/data/products";
import type { Category, Product } from "@/lib/index";
import { staggerContainer, staggerItem, springPresets } from "@/lib/motion";

const SORT_OPTIONS = [
  { value: "featured", label: "Destacados" },
  { value: "price-asc", label: "Precio: Menor a Mayor" },
  { value: "price-desc", label: "Precio: Mayor a Menor" },
  { value: "rating", label: "Mejor Valorados" },
  { value: "newest", label: "Más Nuevos" },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);

  const activeCategory = searchParams.get("category") || "all";

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
        // Mantiene fallback local si no hay backend disponible.
      }
    }

    loadCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  const setCategory = (cat: string) => {
    if (cat === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", cat);
    }
    setSearchParams(searchParams);
  };

  const filtered = useMemo(() => {
    let list = [...products];

    if (activeCategory === "sale") {
      list = list.filter((p) => p.badge === "sale");
    } else if (activeCategory !== "all") {
      list = list.filter((p) => p.category === activeCategory);
    }

    if (search.trim()) {
      list = list.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    return list;
  }, [activeCategory, search, sort]);

  const allCategories = [{ id: "all", name: "Todos", icon: "🛍️", count: products.length }, ...categories];

  return (
    <Layout>
      <CartDrawer />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springPresets.gentle}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-1">
            {activeCategory === "all"
              ? "Todos los Productos"
              : activeCategory === "sale"
              ? "Productos en Oferta"
              : categories.find((c) => c.id === activeCategory)?.name || "Productos"}
          </h1>
          <p className="text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "producto encontrado" : "productos encontrados"}
          </p>
        </motion.div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {allCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card border border-border text-foreground hover:border-primary/50 hover:bg-primary/5"
              }`}
            >
              <span className="mr-1.5">{cat.icon}</span>
              {cat.name}
              <span className="ml-1.5 text-xs opacity-70">({cat.count})</span>
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setSearch("")}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Products grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-6xl mb-4">🔍</span>
            <h3 className="text-xl font-semibold text-foreground mb-2">No encontramos resultados</h3>
            <p className="text-muted-foreground mb-4">
              Prueba con otro término o explora todas las categorías
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setCategory("all");
              }}
            >
              Limpiar filtros
            </Button>
          </div>
        ) : (
          <motion.div
            key={`${activeCategory}-${sort}`}
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filtered.map((product, i) => (
              <motion.div key={product.id} variants={staggerItem}>
                <ProductCard product={product} index={i} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
