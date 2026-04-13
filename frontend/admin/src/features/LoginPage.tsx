import { FormEvent, useState } from "react";

import { saveAdminToken } from "../lib/auth";
import { loginAdmin, runSeed } from "../lib/api";

export function LoginPage() {
  const [email, setEmail] = useState("admin@shoestore.local");
  const [password, setPassword] = useState("Admin12345");
  const [message, setMessage] = useState("");

  async function onSeed() {
    try {
      const auth = await loginAdmin(email, password);
      saveAdminToken(auth.tokens.access_token);
      await runSeed(auth.tokens.access_token);
      setMessage("Seed ejecutado y token admin guardado.");
    } catch {
      setMessage("No se pudo ejecutar seed. Intenta loguearte primero.");
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const auth = await loginAdmin(email, password);
      saveAdminToken(auth.tokens.access_token);
      setMessage("Sesion admin iniciada correctamente.");
    } catch {
      setMessage("Credenciales invalidas para admin.");
    }
  }

  return (
    <section className="panel">
      <h2>Acceso administrador</h2>
      <form className="form-grid" onSubmit={onSubmit}>
        <label>
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
        </label>
        <label>
          Password
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
        </label>
        <button type="submit">Entrar</button>
      </form>
      <button type="button" onClick={onSeed}>
        Ejecutar seed inicial
      </button>
      {message && <p>{message}</p>}
    </section>
  );
}
