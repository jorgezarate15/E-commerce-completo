# E-commerce completo

Proyecto fullstack de e-commerce con:

- Backend en Node.js + Express + MongoDB
- Frontend Admin en React + Vite + TypeScript
- Frontend Client en React + Vite + TypeScript

## Arquitectura

- backend: API REST, autenticacion JWT, seed y analytics
- frontend/admin: panel administrativo (productos, pedidos, usuarios, analytics)
- frontend/client: tienda publica (catalogo, detalle, carrito y checkout)

## Requisitos

- Node.js 18 o superior (recomendado 20+)
- npm 9 o superior
- MongoDB local o remoto

## Estructura principal

- backend
- frontend/admin
- frontend/client

## Puertos por defecto

- Backend: 8000
- Admin: 5173
- Client: 5174 (o 5173 si 5174 no esta ocupado)

## Variables de entorno

### Backend

Archivo: backend/.env

Variables minimas:

- NODE_ENV=development
- PORT=8000
- JWT_SECRET=dev-super-secret
- ACCESS_TOKEN_TTL=15m
- REFRESH_TOKEN_TTL=7d
- SEED_BOOTSTRAP_KEY=change-me-in-dev
- MONGODB_URI
- ALLOWED_ORIGINS

Ejemplo recomendado:

```env
NODE_ENV=development
PORT=8000
MONGODB_URI=mongodb://127.0.0.1:27017/ecommerce_db
JWT_SECRET=dev-super-secret
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d
SEED_BOOTSTRAP_KEY=change-me-in-dev
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174
```

### Frontend Admin

Archivo: frontend/admin/.env.example (copiar a .env si quieres personalizar)

Variable clave:

- VITE_API_BASE_URL

Ejemplo:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### Frontend Client

Archivo: frontend/client/.env.example (copiar a .env si quieres personalizar)

Variable clave:

- VITE_API_BASE_URL

Ejemplo:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## Instalacion

### 1) Backend

1. Ir a la carpeta backend
2. Instalar dependencias con npm install
3. Configurar backend/.env
4. Levantar con npm run dev

### 2) Frontend Admin

1. Ir a frontend/admin
2. Instalar dependencias con npm install
3. Configurar .env (opcional)
4. Levantar con npm run dev

### 3) Frontend Client

1. Ir a frontend/client
2. Instalar dependencias con npm install
3. Configurar .env (opcional)
4. Levantar con npm run dev

## Flujo recomendado de primer arranque

1. Levantar backend
1. Hacer bootstrap de datos (solo development) usando endpoint POST /api/v1/seed/bootstrap con header x-seed-key
1. Entrar al admin y hacer login con:

   - Email: admin arroba shoestore punto local
   - Password: Admin12345
1. Probar el client en su puerto de Vite

## Endpoints clave

- GET /health
- POST /api/v1/auth/login
- POST /api/v1/auth/refresh
- GET /api/v1/products
- GET /api/v1/products/:id
- GET /api/v1/categories
- GET /api/v1/admin/products
- GET /api/v1/admin/orders
- GET /api/v1/admin/users
- GET /api/v1/admin/analytics

## Notas importantes

- La seed de desarrollo esta protegida por entorno y permisos.
- Los listados tienen paginacion basica (page y page_size).
- Si cambia la URL del backend, actualiza VITE_API_BASE_URL en admin y client.

## Solucion de problemas

- Error de CORS: revisa ALLOWED_ORIGINS en backend/.env
- Error de login admin: confirma seed ejecutada y base de datos correcta
- Error de conexion MongoDB: verifica MONGODB_URI y acceso de red/credenciales
- Puerto ocupado: cambia PORT o el puerto de Vite

## Scripts utiles

Backend:

- npm run dev
- npm start

Admin:

- npm run dev
- npm run build
- npm run preview

Client:

- npm run dev
- npm run build
- npm run preview
