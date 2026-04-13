import { useEffect, useState } from "react";

import { getOrders } from "../lib/api";
import { getAccessToken } from "../lib/auth";
import type { OrderSummary } from "../types";

export function OrdersPage() {
  const [items, setItems] = useState<OrderSummary[]>([]);
  const [message, setMessage] = useState("Inicia sesion para ver historial de pedidos.");

  useEffect(() => {
    async function loadOrders() {
      const token = getAccessToken();
      if (!token) {
        return;
      }
      try {
        const response = await getOrders(token);
        setItems(response.items);
        setMessage("");
      } catch (error) {
        const text = error instanceof Error ? error.message : "No se pudieron cargar pedidos";
        setMessage(text);
      }
    }

    loadOrders();
  }, []);

  return (
    <section>
      <h2>Historial y seguimiento</h2>
      {message && <p>{message}</p>}
      <div className="panel">
        {items.map((order) => (
          <article key={order.id} className="cart-row">
            <h3>Pedido #{order.id}</h3>
            <p>
              Estado: {order.status} | Total: ${order.total.toFixed(2)}
            </p>
            <p>
              Tracking: {order.tracking_number ?? "Pendiente"}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
