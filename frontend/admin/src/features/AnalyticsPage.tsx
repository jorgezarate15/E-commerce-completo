import { FormEvent, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getAdminToken } from "../lib/auth";
import { getAdminAnalytics } from "../lib/api";
import type { AdminAnalyticsResponse } from "../types";

export function AnalyticsPage() {
  const [data, setData] = useState<AdminAnalyticsResponse | null>(null);
  const [message, setMessage] = useState("Necesitas login admin para cargar analiticas.");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  async function loadAnalytics() {
    const token = getAdminToken();
    if (!token) {
      return;
    }
    try {
      const response = await getAdminAnalytics(token, {
        from: fromDate || undefined,
        to: toDate || undefined,
        status: statusFilter || undefined,
      });
      setData(response);
      setMessage("");
    } catch {
      setMessage("No se pudieron cargar las analiticas.");
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  function onApplyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    loadAnalytics();
  }

  return (
    <section>
      <h2>Dashboard de analiticas</h2>
      {message && <p>{message}</p>}

      <form className="panel form-grid" onSubmit={onApplyFilters}>
        <label>
          Desde
          <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
        </label>
        <label>
          Hasta
          <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
        </label>
        <label>
          Estado
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">Todos</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
        <button type="submit">Aplicar filtros</button>
      </form>

      {data && (
        <>
          <div className="kpi-grid">
            <article className="panel kpi-card">
              <h3>Pedidos Totales</h3>
              <strong>{data.total_orders}</strong>
            </article>
            <article className="panel kpi-card">
              <h3>Pedidos Pagados</h3>
              <strong>{data.paid_orders}</strong>
            </article>
            <article className="panel kpi-card">
              <h3>Ingresos</h3>
              <strong>${data.total_revenue.toFixed(2)}</strong>
            </article>
            <article className="panel kpi-card">
              <h3>Ticket Promedio</h3>
              <strong>${data.average_order_value.toFixed(2)}</strong>
            </article>
            <article className="panel kpi-card">
              <h3>Pedidos Hoy</h3>
              <strong>{data.orders_today}</strong>
            </article>
          </div>

          <div className="panel">
            <h3>Pedidos por estado</h3>
            {data.status_breakdown.map((bucket) => (
              <p key={bucket.status}>
                {bucket.status}: {bucket.count}
              </p>
            ))}
          </div>

          <div className="panel">
            <h3>Top productos vendidos</h3>
            {data.top_products.map((item) => (
              <article className="row" key={item.product_name}>
                <p>{item.product_name}</p>
                <p>
                  Unidades: {item.units_sold} | Revenue: ${item.revenue.toFixed(2)}
                </p>
              </article>
            ))}
          </div>

          <div className="panel">
            <h3>Revenue diario</h3>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data.daily_series}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#0f172a" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="panel">
            <h3>Pedidos diarios</h3>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.daily_series}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="orders" fill="#0f172a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
