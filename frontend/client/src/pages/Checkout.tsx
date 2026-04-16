import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  ArrowLeft,
  CreditCard,
  Truck,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Layout } from "@/components/Layout";
import { CartDrawer } from "@/components/CartDrawer";
import { useCart } from "@/hooks/useCart";
import { formatPrice, ROUTE_PATHS } from "@/lib/index";
import { springPresets, fadeInUp } from "@/lib/motion";

const STEPS = ["Entrega", "Pago", "Confirmación"];

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  country: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  cardName: string;
}

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
    country: "España",
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardName: "",
  });

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const shipping = total() > 50 ? 0 : 4.99;
  const orderTotal = total() + shipping;

  const handleOrder = () => {
    setStep(2);
    clearCart();
  };

  if (items.length === 0 && step !== 2) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <span className="text-6xl mb-4 block">🛒</span>
          <h2 className="text-2xl font-bold text-foreground mb-4">Tu carrito está vacío</h2>
          <Button onClick={() => navigate(ROUTE_PATHS.PRODUCTS)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Ir a la Tienda
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <CartDrawer />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    i < step
                      ? "bg-emerald-500 text-white"
                      : i === step
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span
                  className={`text-sm font-medium ${
                    i === step ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-12 h-0.5 ${i < step ? "bg-emerald-500" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 2: Confirmation */}
        {step === 2 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springPresets.bouncy}
            className="max-w-md mx-auto text-center py-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ ...springPresets.bouncy, delay: 0.2 }}
              className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </motion.div>
            <h2 className="text-3xl font-bold text-foreground mb-2">¡Pedido Confirmado!</h2>
            <p className="text-muted-foreground mb-2">
              Gracias por tu compra, <strong>{form.name || "cliente"}</strong>. 🎉
            </p>
            <p className="text-muted-foreground mb-8">
              Recibirás un email de confirmación en <strong>{form.email || "tu correo"}</strong> en breve.
            </p>
            <div className="bg-card border border-border rounded-2xl p-6 mb-8 text-left space-y-2">
              <p className="text-sm text-muted-foreground">Número de pedido</p>
              <p className="font-mono font-bold text-foreground text-lg">
                #{Math.random().toString(36).substring(2, 10).toUpperCase()}
              </p>
            </div>
            <Button
              className="w-full"
              size="lg"
              onClick={() => navigate(ROUTE_PATHS.HOME)}
            >
              Volver al inicio
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div
                    key="delivery"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={springPresets.gentle}
                    className="bg-card border border-border rounded-2xl p-6 space-y-5"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="w-5 h-5 text-primary" />
                      <h2 className="text-lg font-semibold text-foreground">Dirección de Entrega</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <Label>Nombre completo *</Label>
                        <Input
                          className="mt-1.5"
                          placeholder="Juan García"
                          value={form.name}
                          onChange={set("name")}
                        />
                      </div>
                      <div>
                        <Label>Email *</Label>
                        <Input
                          className="mt-1.5"
                          type="email"
                          placeholder="juan@email.com"
                          value={form.email}
                          onChange={set("email")}
                        />
                      </div>
                      <div>
                        <Label>Teléfono</Label>
                        <Input
                          className="mt-1.5"
                          type="tel"
                          placeholder="+34 600 000 000"
                          value={form.phone}
                          onChange={set("phone")}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label>Dirección *</Label>
                        <Input
                          className="mt-1.5"
                          placeholder="Calle Mayor, 123, 4ºA"
                          value={form.address}
                          onChange={set("address")}
                        />
                      </div>
                      <div>
                        <Label>Ciudad *</Label>
                        <Input
                          className="mt-1.5"
                          placeholder="Madrid"
                          value={form.city}
                          onChange={set("city")}
                        />
                      </div>
                      <div>
                        <Label>Código Postal *</Label>
                        <Input
                          className="mt-1.5"
                          placeholder="28001"
                          value={form.zip}
                          onChange={set("zip")}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label>País</Label>
                        <Input
                          className="mt-1.5"
                          value={form.country}
                          onChange={set("country")}
                        />
                      </div>
                    </div>

                    <Button
                      className="w-full mt-2"
                      size="lg"
                      onClick={() => setStep(1)}
                      disabled={!form.name || !form.email || !form.address || !form.city || !form.zip}
                    >
                      Continuar al Pago
                    </Button>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={springPresets.gentle}
                    className="bg-card border border-border rounded-2xl p-6 space-y-5"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="w-5 h-5 text-primary" />
                      <h2 className="text-lg font-semibold text-foreground">Información de Pago</h2>
                    </div>

                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center gap-2 text-sm text-muted-foreground">
                      <Lock className="w-4 h-4 text-primary flex-shrink-0" />
                      Pago encriptado con SSL de 256 bits. Tus datos están seguros.
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label>Nombre en la tarjeta *</Label>
                        <Input
                          className="mt-1.5"
                          placeholder="JUAN GARCIA"
                          value={form.cardName}
                          onChange={set("cardName")}
                        />
                      </div>
                      <div>
                        <Label>Número de tarjeta *</Label>
                        <Input
                          className="mt-1.5 font-mono"
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          value={form.cardNumber}
                          onChange={(e) => {
                            const v = e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
                            setForm((prev) => ({ ...prev, cardNumber: v }));
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Fecha de caducidad *</Label>
                          <Input
                            className="mt-1.5 font-mono"
                            placeholder="MM/AA"
                            maxLength={5}
                            value={form.expiry}
                            onChange={set("expiry")}
                          />
                        </div>
                        <div>
                          <Label>CVV *</Label>
                          <Input
                            className="mt-1.5 font-mono"
                            placeholder="123"
                            maxLength={4}
                            type="password"
                            value={form.cvv}
                            onChange={set("cvv")}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setStep(0)}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Volver
                      </Button>
                      <Button
                        className="flex-1 gap-2"
                        onClick={handleOrder}
                        disabled={!form.cardName || !form.cardNumber || !form.expiry || !form.cvv}
                      >
                        <Lock className="w-4 h-4" />
                        Confirmar Pedido
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-2xl p-5 sticky top-28">
                <h3 className="font-semibold text-foreground mb-4">Resumen del Pedido</h3>

                <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-3 items-center">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-1">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-foreground flex-shrink-0">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground font-medium">{formatPrice(total())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Envío</span>
                    <span className={shipping === 0 ? "text-emerald-500 font-medium" : "text-foreground font-medium"}>
                      {shipping === 0 ? "¡GRATIS!" : formatPrice(shipping)}
                    </span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between text-base font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(orderTotal)}</span>
                  </div>
                </div>

                {total() < 50 && (
                  <p className="text-xs text-muted-foreground mt-3 bg-muted/50 rounded-lg p-2.5">
                    🚚 Añade{" "}
                    <strong>{formatPrice(50 - total())}</strong> más para obtener
                    envío gratis.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
