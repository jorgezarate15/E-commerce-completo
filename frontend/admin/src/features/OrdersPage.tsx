import { useEffect, useState } from "react";

import { getAdminToken } from "../lib/auth";
import { getAdminOrders, updateOrderStatus } from "../lib/api";
import type { AdminOrderSummary } from "../types";

export function OrdersPage() {
  const [items, setItems] = useState<AdminOrderSummary[]>([]);
  const [message, setMessage] = useState("Necesitas login admin para gestionar pedidos.");

  useEffect(() => {
    async function load() {
      const token = getAdminToken();
      if (!token) {
        return;
      }
      try {
        const response = await getAdminOrders(token);
        setItems(response.items);
        setMessage("");
      } catch {
        setMessage("No se pudieron cargar pedidos.");
      }
    }
    load();
  }, []);

  async function changeStatus(orderId: number, status: string) {
    const token = getAdminToken();
    if (!token) {
      return;
    }
    try {
      await updateOrderStatus(token, orderId, status);
      setItems((current) => current.map((item) => (item.id === orderId ? { ...item, status } : item)));
    } catch {
      setMessage("No se pudo actualizar el estado del pedido.");
    }
  }

  return (
    <section>
      <h2>Gestion de pedidos</h2>
      {message && <p>{message}</p>}
      <div className="panel">
        {items.map((item) => (
          <article className="row" key={item.id}>
            <h3>Pedido #{item.id}</h3>
            <p>{item.customer_email}</p>
            <p>
              Estado: {item.status} | Total: ${item.total.toFixed(2)}
            </p>
            <div className="actions">
              <button type="button" onClick={() => changeStatus(item.id, "processing")}>Processing</button>
              <button type="button" onClick={() => changeStatus(item.id, "shipped")}>Shipped</button>
              <button type="button" onClick={() => changeStatus(item.id, "delivered")}>Delivered</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
