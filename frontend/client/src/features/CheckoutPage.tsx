import { FormEvent, useState } from "react";

import { confirmPayment, createOrder, createPaymentIntent, triggerMockWebhook } from "../lib/api";
import { getAccessToken } from "../lib/auth";

export function CheckoutPage() {
  const [shippingAddress, setShippingAddress] = useState("Calle Principal 123, Ciudad");
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
  const [paymentProvider, setPaymentProvider] = useState<"stripe" | "paypal">("stripe");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = getAccessToken();
    if (!token) {
      setMessage("Debes iniciar sesion antes de confirmar checkout.");
      return;
    }

    setIsLoading(true);
    setMessage("");
    try {
      const orderResponse = await createOrder(token, {
        shipping_address: shippingAddress,
        shipping_method: shippingMethod,
      });

      const intent = await createPaymentIntent(token, orderResponse.order.id, paymentProvider);
      await confirmPayment(token, intent.payment_id);
      await triggerMockWebhook(intent.provider_reference);

      setMessage(
        `Orden #${orderResponse.order.id} creada y pagada con ${paymentProvider.toUpperCase()}. Estado actualizado a processing.`,
      );
    } catch (error) {
      const text = error instanceof Error ? error.message : "No se pudo crear la orden";
      setMessage(text);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section>
      <h2>Checkout seguro y guiado</h2>
      <form className="panel form-grid" onSubmit={onSubmit}>
        <label>
          Direccion de envio
          <input value={shippingAddress} onChange={(event) => setShippingAddress(event.target.value)} required />
        </label>

        <label>
          Metodo de envio
          <select value={shippingMethod} onChange={(event) => setShippingMethod(event.target.value as "standard" | "express")}>
            <option value="standard">Estandar</option>
            <option value="express">Express</option>
          </select>
        </label>

        <label>
          Metodo de pago
          <select value={paymentProvider} onChange={(event) => setPaymentProvider(event.target.value as "stripe" | "paypal")}>
            <option value="stripe">Stripe (simulado)</option>
            <option value="paypal">PayPal (simulado)</option>
          </select>
        </label>

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Procesando..." : "Confirmar pedido"}
        </button>
      </form>

      {message && <p>{message}</p>}
    </section>
  );
}
