import { Link, Route, Routes } from "react-router-dom";

import { CatalogPage } from "../features/CatalogPage";
import { CartPage } from "../features/CartPage";
import { CheckoutPage } from "../features/CheckoutPage";
import { LoginPage } from "../features/LoginPage";
import { OrdersPage } from "../features/OrdersPage";
import { ProfilePage } from "../features/ProfilePage";

export function App() {
  return (
    <div className="layout">
      <header className="header">
        <h1>Shoe Store</h1>
        <nav>
          <Link to="/">Catalogo</Link>
          <Link to="/cart">Carrito</Link>
          <Link to="/checkout">Checkout</Link>
          <Link to="/orders">Mis pedidos</Link>
          <Link to="/profile">Perfil</Link>
          <Link to="/login">Login</Link>
        </nav>
      </header>
      <main className="content">
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </main>
    </div>
  );
}
