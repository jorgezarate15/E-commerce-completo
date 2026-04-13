import { useEffect, useState } from "react";

import { getCart } from "../lib/api";
import { getAccessToken } from "../lib/auth";
import type { CartResponse } from "../types";

export function CartPage() {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [message, setMessage] = useState("Inicia sesion para cargar carrito persistente.");

  useEffect(() => {
    async function loadCart() {
      const token = getAccessToken();
      if (!token) {
        return;
      }
      try {
        const response = await getCart(token);
        setCart(response);
        setMessage("");
      } catch (error) {
        const text = error instanceof Error ? error.message : "No se pudo cargar carrito";
        setMessage(text);
      }
    }

    loadCart();
  }, []);

  return (
    <section>
      <h2>Carrito persistente</h2>
      {message && <p>{message}</p>}
      {cart && (
        <div className="panel">
          {cart.items.map((item) => (
            <article key={item.id} className="cart-row">
              <h3>{item.product_name}</h3>
              <p>
                Talla {item.size} - {item.color}
              </p>
              <p>
                Cantidad: {item.quantity} | Unitario: ${item.unit_price.toFixed(2)} | Linea: ${item.line_total.toFixed(2)}
              </p>
            </article>
          ))}
          <p>Subtotal: ${cart.subtotal.toFixed(2)}</p>
          <p>Impuestos: ${cart.taxes.toFixed(2)}</p>
          <p>Envio estimado: ${cart.shipping_estimate.toFixed(2)}</p>
          <p>Descuento: ${cart.discount_total.toFixed(2)}</p>
          <p>Total: ${cart.total.toFixed(2)}</p>
        </div>
      )}
    </section>
  );
}
