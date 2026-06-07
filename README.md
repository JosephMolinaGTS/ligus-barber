# LIGUS BARBER — Sistema de Gestión de Barbería

Plataforma web completa para administrar una barbería con múltiples sucursales, inspirada en la estructura funcional de AgendaPro.

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite |
| Navegación | React Router DOM v6 |
| HTTP | Axios |
| Estilos | Tailwind CSS |
| Backend | Express.js (Node.js) |
| Base de datos | MongoDB + Mongoose |
| Autenticación | JWT + bcrypt |
| Gráficas | Recharts |

## Estructura del Proyecto

```
ligus-barber/
├── backend/
│   ├── src/
│   │   ├── config/         # Conexión DB, JWT config
│   │   ├── controllers/    # Lógica de cada endpoint
│   │   ├── middleware/      # Auth, roles, errores, validación
│   │   ├── models/         # Schemas de Mongoose
│   │   ├── routes/         # Definición de rutas API
│   │   ├── utils/          # Helpers, seed script
│   │   └── server.js       # Entry point
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── layouts/        # Layouts (público, admin)
│   │   ├── pages/          # Páginas por módulo
│   │   ├── routes/         # Rutas React
│   │   ├── services/       # Capa API (axios)
│   │   ├── context/        # AuthContext
│   │   ├── hooks/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tailwind.config.js
│   └── package.json
```

## Requisitos Previos

- [Node.js](https://nodejs.org/) v18 o superior
- [MongoDB](https://www.mongodb.com/) (local o Atlas)
- npm o yarn

## Instalación y Ejecución

### 1. Clonar o ubicar el proyecto

```bash
cd ligus-barber
```

### 2. Configurar Backend

```bash
cd backend
npm install
```

Editar el archivo `.env` con tu conexión a MongoDB:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ligus-barber
JWT_SECRET=tu-secreto-super-seguro-aqui
JWT_EXPIRE=7d
```

### 3. Sembrar datos de prueba (opcional)

```bash
npm run seed
```

Esto crea usuarios, sucursales, servicios, productos y citas de prueba.

### 4. Iniciar Backend

```bash
npm run dev
```

El servidor corre en `http://localhost:5000`

### 5. Configurar Frontend (otra terminal)

```bash
cd ../frontend
npm install
npm run dev
```

El frontend corre en `http://localhost:3000`

## Credenciales de Prueba

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Dueño | owner@ligus.com | 123456 |
| Administrador | admin@ligus.com | 123456 |
| Barbero | carlos@ligus.com | 123456 |
| Cliente | juan@email.com | 123456 |

## Módulos del Sistema

### 1. Página Pública
- Landing page con hero, servicios, productos y sucursales
- Catálogo de servicios con filtros
- Catálogo de productos con filtros por categoría y sucursal
- Lista de sucursales

### 2. Autenticación
- Login con JWT
- Registro de usuarios
- Protección de rutas por rol
- Roles: dueño, administrador, barbero, cliente

### 3. Agenda de Citas
- Flujo multi-paso: sucursal → servicio → barbero → fecha → hora → confirmar
- Verificación de disponibilidad horaria
- Estados: pendiente, confirmada, completada, cancelada

### 4. Gestión de Sucursales
- CRUD completo
- Horarios de atención por día
- Activo/inactivo

### 5. Gestión de Servicios
- CRUD completo
- Precio, duración, sucursales disponibles
- Barberos que pueden realizarlo

### 6. Gestión de Empleados
- CRUD completo
- Asignación a sucursal
- Roles: barbero o administrador

### 7. Gestión de Clientes
- CRUD completo
- Historial de citas
- Búsqueda por nombre, email o teléfono

### 8. Catálogo de Productos
- CRUD completo
- Categorías: pomadas, ceras, shampoo, aceites, after-shave, peines, kits
- Indicador de producto promocionado
- Stock por sucursal

### 9. Dashboard del Dueño
- Métricas: total citas, completadas, canceladas, ingresos, clientes
- Gráfica de barras: citas por mes
- Gráfica circular: distribución de servicios
- Gráfica de línea: ingresos por mes
- Ranking de barberos y sucursales
- Tabla de últimos movimientos
- Filtros por día, mes y año

### 10. Navegación
- Navbar pública con menú responsive
- Sidebar administrativo colapsable
- Rutas protegidas por rol
- Separación de vistas por rol

## Roles y Permisos

| Rol | Acceso |
|-----|--------|
| **Dueño** | Dashboard global, CRUD de todo, métricas |
| **Administrador** | CRUD de su sucursal, ver citas, clientes, empleados |
| **Barbero** | Ver sus citas asignadas |
| **Cliente** | Ver servicios, productos, sucursales, agendar citas |

## API Endpoints

### Auth
- `POST /api/auth/register` — Registro
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Usuario actual
- `PUT /api/auth/me` — Actualizar perfil
- `PUT /api/auth/change-password` — Cambiar contraseña

### Sucursales
- `GET /api/branches` — Listar (admin/owner)
- `GET /api/branches/:id` — Obtener una
- `POST /api/branches` — Crear (owner/admin)
- `PUT /api/branches/:id` — Actualizar (owner/admin)
- `DELETE /api/branches/:id` — Eliminar (owner)
- `GET /api/public/branches` — Público

### Servicios
- `GET /api/services` — Listar (admin/owner)
- `GET /api/services/:id` — Obtener una
- `POST /api/services` — Crear (owner/admin)
- `PUT /api/services/:id` — Actualizar (owner/admin)
- `DELETE /api/services/:id` — Eliminar (owner)
- `GET /api/public/services` — Público

### Citas
- `GET /api/appointments` — Listar (con filtros)
- `GET /api/appointments/mine` — Mis citas
- `GET /api/appointments/available-slots` — Horarios disponibles
- `POST /api/appointments` — Crear
- `PUT /api/appointments/:id` — Actualizar
- `PATCH /api/appointments/:id/cancel` — Cancelar

### Productos
- `GET /api/products` — Listar (admin/owner)
- `POST /api/products` — Crear (owner/admin)
- `PUT /api/products/:id` — Actualizar (owner/admin)
- `DELETE /api/products/:id` — Eliminar (owner)
- `GET /api/public/products` — Público

### Dashboard
- `GET /api/dashboard` — Métricas (solo owner)

## Paleta de Colores

| Color | Hex | Uso |
|-------|-----|-----|
| Negro | `#000000` | Fondo principal |
| Carbón | `#1A1A1A` | Cards, sidebar |
| Azul | `#004B7A` | Botones primarios, links |
| Rojo | `#9B0000` | Eliminar, alertas |
| Blanco | `#FFFFFF` | Textos principales |
| Gris | `#CFCFCF` | Textos secundarios |

## Licencia

Proyecto de aprendizaje — LIGUS BARBER
