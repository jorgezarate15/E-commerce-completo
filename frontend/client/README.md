# Frontend Client - E-commerce

Aplicacion publica de la tienda construida con React, Vite y TypeScript.

## Stack

- React 18
- Vite
- TypeScript
- React Router
- Tailwind y componentes UI
- Axios para consumo de API

## Requisitos

- Node.js 18 o superior
- npm 9 o superior
- Backend corriendo en local

## Configuracion

1. Copia .env.example a .env.
1. Define la URL de la API.

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Si no defines esa variable, el proyecto usa ese valor por defecto.

## Instalacion y ejecucion

1. Instala dependencias.

```bash
npm install
```

1. Levanta entorno de desarrollo.

```bash
npm run dev
```

1. Genera build de produccion.

```bash
npm run build
```

1. Ejecuta preview local del build.

```bash
npm run preview
```

## Scripts

- npm run dev: inicia Vite en desarrollo.
- npm run build: compila para produccion.
- npm run build:dev: compila en modo development con sourcemap.
- npm run build:map: compila con sourcemap.
- npm run preview: vista previa del build.
- npm run preview:dev: build development y preview.
- npm run lint: ejecuta lint.

## Estructura recomendada

- src/App.tsx: shell principal.
- src/pages: paginas de negocio.
- src/components: componentes reutilizables.
- src/components/ui: libreria UI base.
- src/api: clientes y funciones de API.
- src/hooks: hooks custom.
- src/data: datos locales y mocks.
- src/lib: utilidades compartidas.

## Integracion con backend

Endpoints usados por el client:

- GET /api/v1/products
- GET /api/v1/products/:id
- GET /api/v1/categories

Archivo principal de API:

- src/api/store.ts

## Problemas comunes

- Error de CORS:
  - Revisa ALLOWED_ORIGINS en backend/.env.
- API no responde:
  - Verifica VITE_API_BASE_URL y que backend este en linea.
- Pantalla en blanco despues de cambios:
  - Limpia cache de Vite y reinicia npm run dev.

## Buenas practicas para desarrollo

- Mantener componentes pequenos y con responsabilidad unica.
- Evitar logica de negocio pesada dentro de componentes de UI.
- Centralizar llamadas HTTP en src/api.
- Tipar respuestas de API para prevenir regresiones.
