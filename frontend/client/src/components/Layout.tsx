import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Search,
  Menu,
  X,
  Heart,
  User,
  ChevronDown,
  Truck,
  Shield,
  RotateCcw,
  Mail,
  Instagram,
  Facebook,
  Twitter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ROUTE_PATHS } from "@/lib/index";
import { useCart } from "@/hooks/useCart";
import { springPresets } from "@/lib/motion";
import { products } from "@/data/products";
import { getStoreProducts } from "@/api/store";
import { SiInstagram, SiFacebook, SiX } from "react-icons/si";

const navLinks = [
  { label: "Inicio", path: ROUTE_PATHS.HOME },
  { label: "Tienda", path: ROUTE_PATHS.PRODUCTS },
];

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [catalogProducts, setCatalogProducts] = useState(products);
  const { totalItems, openCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadProducts() {
      try {
        const remoteProducts = await getStoreProducts();
        if (isMounted && remoteProducts.length > 0) {
          setCatalogProducts(remoteProducts);
        }
      } catch {
        // Mantiene el fallback local cuando el backend no esta disponible.
      }
    }
    loadProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredSearch = catalogProducts
    .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 5);

  const handleSearchSelect = (id: number) => {
    setSearchOpen(false);
    setSearchQuery("");
    navigate(`/products/${id}`);
  };

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 shadow-lg border-b border-border"
          : "bg-background/80"
      }`}
      style={{ backdropFilter: "blur(12px)" }}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={springPresets.gentle}
    >
      {/* Announcement bar */}
      <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium">
        🚚 Envío gratuito en pedidos superiores a 50€ — Usa el código{" "}
        <span className="font-mono font-bold">BIENVENIDO10</span> y ahorra 10%
      </div>

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={ROUTE_PATHS.HOME} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">
              Shop<span className="text-primary">Wave</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`
                }
                end={link.path === ROUTE_PATHS.HOME}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(!searchOpen)}
                className="relative"
              >
                <Search className="w-5 h-5" />
              </Button>
              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={springPresets.snappy}
                    className="absolute right-0 top-12 w-80 bg-popover border border-border rounded-xl shadow-xl p-3 z-50"
                  >
                    <Input
                      autoFocus
                      placeholder="Buscar productos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="mb-2"
                    />
                    {searchQuery.length > 1 && (
                      <div className="space-y-1">
                        {filteredSearch.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-2">
                            Sin resultados
                          </p>
                        ) : (
                          filteredSearch.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => handleSearchSelect(p.id)}
                              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted text-left transition-colors"
                            >
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                              <div>
                                <p className="text-sm font-medium text-foreground line-clamp-1">
                                  {p.name}
                                </p>
                                <p className="text-xs text-primary font-semibold">
                                  {p.price.toFixed(2)} €
                                </p>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Heart className="w-5 h-5" />
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={openCart}
            >
              <ShoppingCart className="w-5 h-5" />
              <AnimatePresence>
                {totalItems() > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={springPresets.bouncy}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-bold"
                  >
                    {totalItems()}
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>

            {/* Mobile toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={springPresets.gentle}
            className="md:hidden border-t border-border bg-background overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-foreground hover:bg-muted"
                    }`
                  }
                  end={link.path === ROUTE_PATHS.HOME}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function Footer() {
  return (
    <footer className="bg-secondary border-t border-border mt-24">
      {/* Trust badges */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Truck, title: "Envío Gratis +50€", desc: "En pedidos superiores a 50€" },
              { icon: Shield, title: "Compra Segura", desc: "Pago 100% seguro y protegido" },
              { icon: RotateCcw, title: "30 Días de Devolución", desc: "Sin preguntas, sin complicaciones" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{title}</p>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to={ROUTE_PATHS.HOME} className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">
                Shop<span className="text-primary">Wave</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Tu tienda de confianza para los mejores productos. Calidad, estilo y precio justo.
            </p>
            <div className="flex gap-3">
              {[SiInstagram, SiFacebook, SiX].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            {
              title: "Tienda",
              links: ["Todos los Productos", "Novedades", "Ofertas", "Más Vendidos"],
            },
            {
              title: "Ayuda",
              links: ["Seguimiento de Pedido", "Devoluciones", "Tamaños", "FAQ"],
            },
            {
              title: "Empresa",
              links: ["Sobre Nosotros", "Blog", "Sostenibilidad", "Contacto"],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-semibold text-foreground mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            © 2026 ShopWave. Todos los derechos reservados.
          </p>
          <div className="flex gap-4">
            {["Privacidad", "Términos", "Cookies"].map((l) => (
              <a key={l} href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-[104px]">{children}</main>
      <Footer />
    </div>
  );
}
