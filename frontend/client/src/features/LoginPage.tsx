import { FormEvent, useState } from "react";

import { login } from "../lib/api";
import { saveAccessToken } from "../lib/auth";

export function LoginPage() {
  const [email, setEmail] = useState("customer@example.com");
  const [password, setPassword] = useState("Password123");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");
    try {
      const response = await login({ email, password });
      saveAccessToken(response.tokens.access_token);
      setMessage("Sesion iniciada. El token se guardo para consumir carrito y ordenes.");
    } catch (error) {
      const description = error instanceof Error ? error.message : "Error inesperado";
      setMessage(`No se pudo iniciar sesion: ${description}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="panel">
      <h2>Iniciar sesion</h2>
      <form className="form-grid" onSubmit={onSubmit}>
        <label>
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
        </label>
        <label>
          Password
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
        </label>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Ingresando..." : "Entrar"}
        </button>
      </form>
      {message && <p>{message}</p>}
    </section>
  );
}
