import { FormEvent, useEffect, useState } from "react";

import { getAdminToken } from "../lib/auth";
import { getAdminUsers, updateUserRole } from "../lib/api";
import type { AdminUserSummary } from "../types";

export function UsersPage() {
  const [items, setItems] = useState<AdminUserSummary[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("Necesitas login admin para gestionar usuarios.");

  async function loadUsers(value: string) {
    const token = getAdminToken();
    if (!token) {
      return;
    }
    try {
      const response = await getAdminUsers(token, value);
      setItems(response.items);
      setMessage("");
    } catch {
      setMessage("No se pudo cargar usuarios.");
    }
  }

  useEffect(() => {
    loadUsers("");
  }, []);

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    loadUsers(search);
  }

  async function changeRole(userId: number, role: string) {
    const token = getAdminToken();
    if (!token) {
      return;
    }
    try {
      await updateUserRole(token, userId, role);
      setItems((current) => current.map((item) => (item.id === userId ? { ...item, role } : item)));
    } catch {
      setMessage("No se pudo actualizar rol de usuario.");
    }
  }

  return (
    <section>
      <h2>Gestion de usuarios y roles</h2>
      <form className="form-grid panel" onSubmit={onSearch}>
        <label>
          Buscar usuario
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Email o nombre" />
        </label>
        <button type="submit">Buscar</button>
      </form>
      {message && <p>{message}</p>}
      <div className="panel">
        {items.map((item) => (
          <article className="row" key={item.id}>
            <h3>{item.full_name}</h3>
            <p>{item.email}</p>
            <p>
              Rol: {item.role} | Activo: {item.is_active ? "Si" : "No"}
            </p>
            <div className="actions">
              <button type="button" onClick={() => changeRole(item.id, "customer")}>Customer</button>
              <button type="button" onClick={() => changeRole(item.id, "admin")}>Admin</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
