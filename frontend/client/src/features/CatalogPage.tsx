import { FormEvent, useEffect, useMemo, useState } from "react";

import { addCartItem, getProducts } from "../lib/api";
import { getAccessToken } from "../lib/auth";
import type { ProductCard } from "../types";

export function CatalogPage() {
  const [items, setItems] = useState<ProductCard[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      setError("");
      try {
        const response = await getProducts({
          page,
          pageSize,
          search,
          brand,
          category,
          size,
          color,
        });
        setItems(response.items);
        setTotal(response.total);
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : "No se pudo cargar el catalogo";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, [brand, category, color, page, pageSize, search, size]);

  function onSubmitFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
  }

  async function onAddToCart(product: ProductCard) {
    const token = getAccessToken();
    if (!token) {
      setActionMessage("Inicia sesion para agregar productos al carrito.");
      return;
    }
    try {
      await addCartItem(token, product.default_variant_id, 1);
      setActionMessage(`Agregado al carrito: ${product.name}`);
    } catch (addError) {
      const message = addError instanceof Error ? addError.message : "No se pudo agregar al carrito";
      setActionMessage(message);
    }
  }

  return (
    <section>
      <h2>Catalogo de zapatos</h2>
      <p>Busqueda y filtros dinamicos por marca, color, talla y categoria.</p>
      <form className="form-grid panel" onSubmit={onSubmitFilters}>
        <label>
          Buscar
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nombre o descripcion" />
        </label>
        <label>
          Marca
          <input value={brand} onChange={(event) => setBrand(event.target.value)} placeholder="Stride" />
        </label>
        <label>
          Categoria
          <input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Running" />
        </label>
        <label>
          Talla
          <input value={size} onChange={(event) => setSize(event.target.value)} placeholder="42" />
        </label>
        <label>
          Color
          <input value={color} onChange={(event) => setColor(event.target.value)} placeholder="Black" />
        </label>
        <button type="submit">Aplicar filtros</button>
      </form>

      {isLoading && <p>Cargando productos...</p>}
      {error && <p>{error}</p>}
      {actionMessage && <p>{actionMessage}</p>}

      <div className="grid">
        {items.map((shoe) => (
          <article key={shoe.id} className="card">
            <h3>{shoe.name}</h3>
            <p>{shoe.brand}</p>
            <p>{shoe.category}</p>
            <strong>
              ${shoe.sale_price?.toFixed(2) ?? shoe.base_price.toFixed(2)}
              {shoe.sale_price && <span> (antes ${shoe.base_price.toFixed(2)})</span>}
            </strong>
            <p>{shoe.in_stock ? "En stock" : "Sin stock"}</p>
            <button type="button" disabled={!shoe.in_stock} onClick={() => onAddToCart(shoe)}>
              Agregar al carrito
            </button>
          </article>
        ))}
      </div>

      <div className="pager">
        <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
          Anterior
        </button>
        <span>
          Pagina {page} de {totalPages}
        </span>
        <button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>
          Siguiente
        </button>
      </div>
    </section>
  );
}
