# Aplicaciones Especificas de Redes

Proyecto de gestión integral de clubes con autenticación de usuarios.

## Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Express + Prisma + SQLite
- **Auth:** JWT

## Estructura

```
├── backend/     # API REST con Express
│   ├── prisma/  # Esquema y migraciones
│   └── src/     # Rutas y middleware
└── frontend/    # SPA con React
    └── src/     # Páginas y componentes
```

## Scripts

```bash
# Instalar dependencias de todo el proyecto
npm run install:all

# Desarrollo
npm run dev:backend   # Puerto 3001
npm run dev:frontend  # Puerto 5173

# Build
npm run build:backend
npm run build:frontend
```

## Variables de entorno

Copiar `backend/.env.example` a `backend/.env` y ajustar los valores:

```bash
cp backend/.env.example backend/.env
```

Contenido de `backend/.env`:

```env
PORT=3001
DATABASE_URL="file:./dev.db"
JWT_SECRET="tu-clave-secreta-aqui"
```

> ⚠️ **Importante:** Nunca commitear el archivo `.env`. Asegurate de que `JWT_SECRET` sea una clave segura y única.

## Características

- Registro e inicio de sesión de usuarios
- Protección de rutas con JWT
- Diseño moderno con Tailwind CSS

