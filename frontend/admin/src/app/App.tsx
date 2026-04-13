import { Suspense, lazy } from "react";
import { Link, Route, Routes } from "react-router-dom";

import { LoginPage } from "../features/LoginPage";
import { OrdersPage } from "../features/OrdersPage";
import { ProductsPage } from "../features/ProductsPage";
import { StockPage } from "../features/StockPage";
import { UsersPage } from "../features/UsersPage";

const AnalyticsPage = lazy(async () => import("../features/AnalyticsPage").then((module) => ({ default: module.AnalyticsPage })));

export function App() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <h1>Shoe Admin</h1>
        <nav>
          <Link to="/">Productos</Link>
          <Link to="/orders">Pedidos</Link>
          <Link to="/users">Usuarios</Link>
          <Link to="/stock">Stock</Link>
          <Link to="/analytics">Analiticas</Link>
          <Link to="/login">Login</Link>
        </nav>
      </aside>
      <main className="content">
        <Routes>
          <Route path="/" element={<ProductsPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/stock" element={<StockPage />} />
          <Route
            path="/analytics"
            element={(
              <Suspense fallback={<p>Cargando analiticas...</p>}>
                <AnalyticsPage />
              </Suspense>
            )}
          />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </main>
    </div>
  );
}
