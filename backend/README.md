# Backend Node.js + MongoDB

API REST para el e-commerce, compatible con los frontends `admin` y `client`.

## Requisitos

- Node.js 18+
- MongoDB local o remoto
- MongoDB Compass (opcional, para visualizacion)

## Configuracion

1. Copia `.env.example` a `.env`.
2. Configura `MONGODB_URI`.

Ejemplo local:

`MONGODB_URI=mongodb://127.0.0.1:27017/ecommerce_db`

## MongoDB Compass

Usa la misma URI del `.env` en Compass para conectarte:

`mongodb://127.0.0.1:27017/ecommerce_db`

Base esperada: `ecommerce_db`

Colecciones:

- `products`
- `users`
- `orders`

## Ejecutar

```bash
npm install
npm run dev
```

Servidor por defecto:

`http://localhost:8000`

## Endpoints principales

- `GET /health`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/seed/dev-seed`
- `POST /api/v1/seed/bootstrap` (solo development + `x-seed-key`)
- `GET /api/v1/products`
- `GET /api/v1/products/:id`
- `GET /api/v1/categories`
- `GET /api/v1/admin/products`
- `GET /api/v1/admin/orders`
- `PATCH /api/v1/admin/orders/:orderId/status`
- `GET /api/v1/admin/users`
- `PATCH /api/v1/admin/users/:userId/role`
- `GET /api/v1/admin/analytics`

## Paginacion

Los listados soportan:

- `page` (default `1`)
- `page_size` (default `20` en admin, `12` en store)

Respuesta incluye:

- `total`
- `page`
- `page_size`
- `total_pages`

## Credenciales admin seed

- Email: `admin@shoestore.local`
- Password: `Admin12345`
