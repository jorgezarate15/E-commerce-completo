import { useEffect, useState } from "react";

import { getAdminToken } from "../lib/auth";
import { getAdminProducts } from "../lib/api";
import type { AdminProductSummary } from "../types";

export function ProductsPage() {
  const [items, setItems] = useState<AdminProductSummary[]>([]);
  const [message, setMessage] = useState("Necesitas login admin para ver productos.");

  useEffect(() => {
    async function load() {
      const token = getAdminToken();
      if (!token) {
        return;
      }
      try {
        const response = await getAdminProducts(token);
        setItems(response.items);
        setMessage("");
      } catch {
        setMessage("No se pudieron cargar productos admin.");
      }
    }
    load();
  }, []);

  return (
    <section>
      <h2>Gestion de productos</h2>
      {message && <p>{message}</p>}
      <div className="panel">
        {items.map((item) => (
          <article className="row" key={item.id}>
            <h3>{item.name}</h3>
            <p>
              {item.brand} - {item.category}
            </p>
            <p>
              Variantes: {item.variants} | Stock total: {item.total_stock}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
