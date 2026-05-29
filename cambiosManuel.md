# cambiosManuel.md — Restructuración Modular para Escalabilidad

> **Fecha:** 2026-05-29  
> **Objetivo:** Asegurar que los módulos del backend y frontend sean escalables, manteniendo separación de responsabilidades y patrones reutilizables para los hitos del cronograma (Fases 2–5).

---

## 1. Resumen Ejecutivo

Se reestructuró el proyecto aplicando una **arquitectura modular por dominio** (Enfoque A: Modularización Ligera). Esto significa que cada módulo del negocio (Auth, Members, y futuros: Disciplinas, Inventario, Mantenimiento) vive en su propia carpeta con capas bien definidas.

**Módulo de ejemplo implementado:** `Members` (Socios) con CRUD completo en backend y frontend.

---

## 2. Cambios en el Backend (`/backend/src/`)

### 2.1 Nueva estructura de carpetas

```
backend/src/
├── modules/                    # ← NUEVO: un folder por dominio de negocio
│   ├── auth/
│   │   ├── auth.routes.ts      # Solo define las rutas Express (HTTP layer)
│   │   ├── auth.controller.ts  # Recibe req/res, delega al service (Controller layer)
│   │   ├── auth.service.ts     # Lógica de negocio: bcrypt, JWT, Prisma (Service layer)
│   │   └── auth.schema.ts      # Validación de inputs con Zod (Validation layer)
│   └── members/                # ← MÓDULO DE EJEMPLO
│       ├── members.routes.ts
│       ├── members.controller.ts
│       ├── members.service.ts
│       └── members.schema.ts
├── middleware/
│   ├── auth.ts                 # (ya existía) Verificación JWT
│   ├── errorHandler.ts         # ← NUEVO: middleware global de errores
│   └── validate.ts             # ← NUEVO: middleware de validación con Zod
├── lib/
│   └── prisma.ts               # (ya existía) Singleton PrismaClient
└── index.ts                    # Solo monta routers y middleware global
```

### 2.2 Separación de capas por módulo

Cada módulo ahora tiene **4 capas claras**:

| Capa | Responsabilidad | Archivo ejemplo |
|------|----------------|-----------------|
| **Routes** | Definir paths HTTP y middleware por ruta | `auth.routes.ts` |
| **Controller** | Extraer datos de req/res, devolver status codes | `auth.controller.ts` |
| **Service** | Lógica de negocio, acceso a DB, reglas | `auth.service.ts` |
| **Schema** | Validar y tipar inputs con Zod | `auth.schema.ts` |

**Antes:** Todo estaba mezclado en un solo archivo `src/routes/auth.ts` (150+ líneas con routing, validación manual, bcrypt, JWT y Prisma).

**Después:** Cada capa tiene su propio archivo pequeño y enfocado.

### 2.3 Validación con Zod

Se instaló `zod` como dependencia. Ahora los inputs se validan automáticamente antes de llegar al controller:

```ts
// auth.schema.ts
export const registerSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
});
```

El middleware `validate.ts` aplica el schema y devuelve errores 400 con mensajes claros:

```ts
router.post("/register", validate(registerSchema), register);
```

### 2.4 Manejo global de errores

Se creó `middleware/errorHandler.ts` que captura **todos** los errores del backend y los transforma en respuestas JSON consistentes:

- Errores conocidos (`EMAIL_EXISTS`, `INVALID_CREDENTIALS`, `DNI_EXISTS`, etc.) → status code + mensaje amigable.
- Errores desconocidos → 500 con mensaje genérico (sin exponer detalles internos).

**Antes:** Cada route handler tenía su propio `try/catch` con `console.error` y "Error interno del servidor".

**Después:** Los controllers pueden lanzar errores normalmente (`throw new Error("EMAIL_EXISTS")`) y el middleware los traduce.

### 2.5 Módulo Members (Socios) — Ejemplo completo

Se implementó un CRUD completo de socios para demostrar cómo se crea un nuevo módulo:

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/members` | GET | Listar todos los socios |
| `/api/members` | POST | Crear un nuevo socio |
| `/api/members/:id` | GET | Obtener un socio por ID |
| `/api/members/:id` | PUT | Actualizar un socio |
| `/api/members/:id` | DELETE | Eliminar un socio |

**Características del módulo:**
- Validación de DNI único
- Inclusión de grupos y asistencias al consultar un socio por ID
- Protegido por `authenticateToken`
- Usa `memberIdSchema` para validar que `:id` sea un número positivo

### 2.6 Módulo Fees (Aranceles Deportivos)

Se implementó un nuevo módulo para gestionar aranceles deportivos y su asignación a socios:

**Nuevos modelos en Prisma:**
- `SportsFee`: Define aranceles disponibles (nombre, monto, descripción, activo)
- `MemberFee`: Vincula aranceles con socios (estado de pago, fecha de pago)

**Endpoints del módulo:**

| Endpoint | Método | Descripción | Rol |
|----------|--------|-------------|-----|
| `/api/fees` | GET | Listar aranceles activos | Cualquiera |
| `/api/fees/:id` | GET | Obtener arancel con asignaciones | Cualquiera |
| `/api/fees` | POST | Crear nuevo arancel | Admin |
| `/api/fees/:id` | PUT | Actualizar arancel | Admin |
| `/api/fees/:id` | DELETE | Eliminar arancel | Admin |
| `/api/fees/assign` | POST | Asignar arancel a socio | Admin |
| `/api/fees/toggle-paid` | POST | Cambiar estado de pago | Cualquiera |
| `/api/fees/member/:memberId` | GET | Ver aranceles de un socio | Cualquiera |
| `/api/fees/all-assignments` | GET | Todas las asignaciones | Cualquiera |

**Características:**
- Protección por rol: solo administradores pueden crear/editar/eliminar aranceles
- Middleware `requireAdmin` reutilizable
- Prevención de asignaciones duplicadas (validación en service)
- Coerción automática de tipos con Zod (`z.coerce.boolean()` para select HTML)

### 2.7 Health check

Se agregó un endpoint `GET /api/health` para monitoreo básico del servidor.

---

## 3. Cambios en el Frontend (`/frontend/src/`)

### 3.1 Nueva estructura de carpetas

```
frontend/src/
├── features/                   # ← NUEVO: un folder por dominio
│   ├── auth/
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── hooks/
│   │   │   └── useAuthActions.ts   # Hooks de login/register
│   │   └── api/
│   │       └── authApi.ts          # Llamadas a la API de auth
│   └── members/                # ← MÓDULO DE EJEMPLO
│       ├── pages/
│       │   └── MembersPage.tsx
│       ├── components/
│       │   ├── MemberList.tsx
│       │   └── MemberForm.tsx
│       ├── hooks/
│       │   └── useMembers.ts
│       └── api/
│           └── membersApi.ts
│   └── fees/                     # ← NUEVO: Módulo Aranceles
│       ├── pages/
│       │   └── FeesPage.tsx
│       ├── components/
│       │   └── MemberFeesManager.tsx
│       ├── hooks/
│       │   └── useFees.ts
│       └── api/
│           └── feesApi.ts
├── components/
│   ├── Navbar.tsx              # (actualizado) Agregó link a /members
│   ├── ProtectedRoute.tsx      # (sin cambios)
│   └── ui/                     # ← NUEVO: componentes genéricos reutilizables
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Card.tsx
│       └── Alert.tsx
├── pages/
│   ├── HomePage.tsx            # (sin cambios)
│   └── DashboardPage.tsx       # (actualizado) Grid de módulos con navegación
├── lib/
│   └── api.ts                  # (actualizado) Mejor manejo de errores
├── context/
│   └── AuthContext.tsx         # (actualizado) Usa authApi, escucha auth:logout
└── App.tsx                     # (actualizado) Lazy loading de rutas
```

### 3.2 Componentes UI reutilizables (`components/ui/`)

Se extrajeron componentes genéricos que antes estaban copiados y pegados en cada formulario:

| Componente | Props principales | Uso |
|------------|-------------------|-----|
| **Button** | `variant`, `size`, `isLoading` | Botones primarios, secundarios, danger, ghost |
| **Input** | `label`, `error`, `icon` | Inputs de formulario con estados de error |
| **Card** | `title`, `subtitle` | Contenedores de contenido con estilo consistente |
| **Alert** | `variant` (error/success/warning/info) | Mensajes de feedback al usuario |

**Beneficio:** Si querés cambiar el estilo de todos los botones, solo editás `Button.tsx`. Antes habría que editar cada página por separado.

### 3.3 Lazy loading (code splitting)

`App.tsx` ahora usa `React.lazy()` y `Suspense` para cargar las páginas bajo demanda:

```ts
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const MembersPage = lazy(() => import("@/features/members/pages/MembersPage"));
```

**Beneficio:** El bundle inicial es más chico. El usuario solo descarga el código de Members cuando navega a `/members`.

### 3.4 Mejora en `apiFetch`

`lib/api.ts` ahora:
- Detecta errores 401 automáticamente y dispara un evento `auth:logout`
- Lanza errores enriquecidos con `statusCode` y `code`
- No usa `import.meta.env` (que daba problemas de tipado) sino una constante
- `AuthContext` escucha el evento `auth:logout` para limpiar el estado global

### 3.5 Custom hooks por feature

Cada módulo tiene hooks que encapsulan la lógica de datos:

```ts
// features/members/hooks/useMembers.ts
const { members, isLoading, error, addMember, editMember, removeMember } = useMembers();
```

**Beneficio:** Las páginas solo se preocupan de la UI. La lógica de fetching, estado y errores vive en el hook.

### 3.6 Módulo Members en el frontend

Se implementó una página completa de gestión de socios:

- **Tabla de socios:** Lista con nombre, DNI, contacto, estado de cuota, deuda y acciones (editar/eliminar).
- **Formulario de alta/edición:** Campos validados con react-hook-form.
- **Estados de carga y error:** Spinners y mensajes de error integrados.
- **Navegación:** Link en Navbar + tarjeta en Dashboard.

### 3.7 Módulo Fees (Aranceles) en el frontend

Se implementó la gestión de aranceles deportivos:

- **Página de aranceles (`/fees`):**
  - Tabla de aranceles disponibles con CRUD (solo admin)
  - Tabla de asignaciones a socios con estado de pago
  - Formulario para crear/editar aranceles

- **Gestión en página de socios (`/members`):**
  - Selector de socio y selector de arancel para asignar
  - Tabla de aranceles asignados al socio seleccionado
  - Botones para marcar como pagado/pendiente
  - Botón para quitar asignación

- **Protección por rol:** Los botones de crear/editar/eliminar aranceles solo aparecen/funcionan para administradores. Si un profesor intenta acceder, el backend devuelve 403.

---

## 4. Cómo agregar un nuevo módulo (guía rápida)

### Backend

1. Crear carpeta `backend/src/modules/<nombre>/`
2. Crear los 4 archivos: `<nombre>.schema.ts`, `<nombre>.service.ts`, `<nombre>.controller.ts`, `<nombre>.routes.ts`
3. Importar y montar el router en `backend/src/index.ts`:
   ```ts
   import nombreRoutes from "./modules/<nombre>/<nombre>.routes";
   app.use("/api/<nombre>", nombreRoutes);
   ```

### Frontend

1. Crear carpeta `frontend/src/features/<nombre>/` con subcarpetas `pages/`, `components/`, `hooks/`, `api/`
2. Crear la API en `features/<nombre>/api/<nombre>Api.ts`
3. Crear los hooks en `features/<nombre>/hooks/use<Nombre>.ts`
4. Crear la página en `features/<nombre>/pages/<Nombre>Page.tsx`
5. Agregar la ruta en `App.tsx` con `lazy()`:
   ```ts
   const NombrePage = lazy(() => import("@/features/<nombre>/pages/<Nombre>Page"));
   ```
6. Agregar el link en `Navbar.tsx` y una tarjeta en `DashboardPage.tsx`

---

## 5. Archivos eliminados o reemplazados

| Archivo viejo | Reemplazado por | Razón |
|---------------|-----------------|-------|
| `backend/src/routes/auth.ts` | `backend/src/modules/auth/*` (4 archivos) | Separación de capas |
| `frontend/src/pages/LoginPage.tsx` | `frontend/src/features/auth/pages/LoginPage.tsx` | Organización por feature |
| `frontend/src/pages/RegisterPage.tsx` | `frontend/src/features/auth/pages/RegisterPage.tsx` | Organización por feature |

---

## 6. Dependencias agregadas

- **Backend:** `zod` (validación de schemas)
- **Frontend:** Ninguna nueva (se usó React.lazy que ya viene con React)

---

## 7. Próximos pasos sugeridos

1. **Agregar Prisma seeder para datos de prueba** de socios (para probar la UI sin crear manualmente).
2. **Implementar roles y permisos** en el frontend (mostrar/ocultar módulos según `roleName`).
3. **Agregar paginación** en `MemberList` cuando haya muchos socios.
4. **Crear el siguiente módulo:** `Disciplinas` siguiendo el mismo patrón (4 capas en backend, 4 carpetas en frontend).

---

**Autor:** OpenCode Agent  
**Commit sugerido:** `git add . && git commit -m "refactor: arquitectura modular por dominio + módulo Members de ejemplo"`
