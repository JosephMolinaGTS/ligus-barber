# LIGUS BARBER — Sistema de Gestión de Barbería

## Descripción
Plataforma web completa para administrar una barbería con múltiples sucursales, inspirada en la estructura funcional de AgendaPro. Permite gestionar citas, servicios, productos, sucursales y empleados con roles diferenciados (propietario, administrador, barbero y cliente).

## Entidades principales

Las dos entidades principales del sistema son **Servicios** y **Sucursales**.

### Servicios (Service)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| name | String (required) | Nombre del servicio |
| description | String | Descripción del servicio |
| price | Number (required) | Precio en MXN |
| duration | Number (required) | Duración en minutos |
| branches | [ObjectId → Branch] | Sucursales donde está disponible |
| barbers | [ObjectId → User] | Barberos que pueden realizarlo |
| isActive | Boolean | Soft delete (default: true) |

### Sucursales (Branch)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| name | String (required) | Nombre de la sucursal |
| address | String (required) | Dirección completa |
| phone | String (required) | Teléfono de contacto |
| schedule.open | String | Hora de apertura (default: 09:00) |
| schedule.close | String | Hora de cierre (default: 20:00) |
| schedule.days | [Number] | Días activos (0=Dom, 6=Sáb) |
| isActive | Boolean | Soft delete (default: true) |

## Relación entre entidades

**Tipo de relación: Referencia ObjectId (Foreign Key)**

La relación entre Servicios y Sucursales es **muchos a muchos**: un servicio puede estar disponible en múltiples sucursales, y una sucursal puede ofrecer múltiples servicios. En Mongoose esto se implementa como un array de referencias ObjectId en el campo `branches` del modelo Service:

```javascript
branches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Branch' }]
```

**Justificación de por qué se eligió referencia ObjectId:**
Se eligió referencia ObjectId en lugar de documento embebido porque:
1. Los datos de las sucursales cambian independientemente de los servicios (actualización de horarios, dirección, etc.)
2. Se necesitan consultas cruzadas (buscar todos los servicios de una sucursal, y todas las sucursales de un servicio)
3. Evita duplicación de datos: si un servicio está en 3 sucursales, no se duplica la información de cada sucursal
4. Permite mantener integridad referencial con validaciones de Mongoose

Otras relaciones en el sistema:
- **Appointment → User (client)**: Referencia ObjectId (muchos a uno)
- **Appointment → User (barber)**: Referencia ObjectId (muchos a uno)
- **Appointment → Branch**: Referencia ObjectId (muchos a uno)
- **Appointment → Service**: Referencia ObjectId (muchos a uno)
- **Product → Branch**: Referencia ObjectId (muchos a uno)
- **User (admin/barber) → Branch**: Referencia ObjectId (muchos a uno)

## Versión de MongoDB
**MongoDB Atlas 8.0.24** — Utilizando Mongoose 8.7.0 como ODM (Object Document Mapper).

> **Nota**: Se utiliza MongoDB Atlas (cloud) para el despliegue en producción. La versión local de desarrollo puede usar MongoDB Community 7.0.x o superior.

## Stack tecnológico
- **Frontend**: React 18 + Vite 5 + Tailwind CSS 3 + Axios + React Router DOM 6 + Recharts
- **Backend**: Express.js 4 + Mongoose 8 + JWT + bcryptjs
- **Base de datos**: MongoDB Atlas 8.0.24 (cloud)
- **Autenticación**: JWT (JSON Web Tokens) con bcrypt para hash de contraseñas

## Instalación y ejecución

### Prerrequisitos
- Node.js v18 o superior
- MongoDB Atlas (configurado en variables de entorno)
- npm

### Pasos
```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd ligus-barber

# Backend
cd backend
npm install
# Configurar archivo .env con las variables de entorno (ver abajo)
npm run seed    # Cargar datos de ejemplo
npm run dev     # Iniciar servidor en http://localhost:5000

# Frontend (otra terminal)
cd frontend
npm install
npm run dev     # Iniciar en http://localhost:3000
```

### Variables de entorno (backend/.env)
```
PORT=5000
MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/ligus-barber?retryWrites=true&w=majority
JWT_SECRET=tu-secreto-seguro-aqui
JWT_EXPIRE=7d
```

> **Nota**: En producción (Render), la variable `MONGODB_URI` se configura directamente en el dashboard del servicio.

## Seed de datos
```bash
cd backend
npm run seed
```
El seed crea automáticamente:
- 2 sucursales (LIGUS Centro, LIGUS Norte)
- 1 propietario, 2 administradores, 6 barberos, 5 clientes
- 6 servicios con precios y duraciones
- 8 productos distribuidos en ambas sucursales
- 10 citas de ejemplo

## Usuario de prueba
| Rol | Email | Contraseña |
|-----|-------|------------|
| **Demo (Dueño)** | **demo@demo.com** | **Demo1234** |
| Propietario | duenoligus@gmail.com | Ligus2024! |
| Admin Centro | admincentro@gmail.com | Admin2024! |
| Admin Norte | adminnorte@gmail.com | AdminNorte2024! |
| Barbero | rodcarlos@gmail.com | Barber2024a! |
| Cliente | perjuan@gmail.com | Client2024! |

## Roles y permisos
| Rol | Acceso |
|-----|--------|
| **Propietario (owner)** | Dashboard global, CRUD completo de todas las entidades, puede eliminar |
| **Administrador (admin)** | CRUD de servicios, empleados, clientes, productos y citas de su sucursal |
| **Barbero** | Consultar su calendario e historial de citas |
| **Cliente** | Agendar citas, ver sus citas, gestionar perfil |

## API Endpoints
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | /api/auth/register | No | Registro de usuario |
| POST | /api/auth/login | No | Inicio de sesión |
| GET | /api/auth/me | Sí | Obtener perfil actual |
| PUT | /api/auth/me | Sí | Actualizar perfil |
| PUT | /api/auth/change-password | Sí | Cambiar contraseña |
| GET | /api/branches | Sí (owner/admin) | Listar sucursales |
| POST | /api/branches | Sí (owner/admin) | Crear sucursal |
| PUT | /api/branches/:id | Sí (owner/admin) | Actualizar sucursal |
| DELETE | /api/branches/:id | Sí (owner) | Eliminar sucursal |
| GET | /api/services | Sí (owner/admin) | Listar servicios |
| POST | /api/services | Sí (owner/admin) | Crear servicio |
| PUT | /api/services/:id | Sí (owner/admin) | Actualizar servicio |
| DELETE | /api/services/:id | Sí (owner) | Eliminar servicio |
| GET | /api/appointments | Sí | Listar citas |
| POST | /api/appointments | Sí | Crear cita |
| PUT | /api/appointments/:id | Sí | Actualizar cita |
| GET | /api/products | Sí (owner/admin) | Listar productos |
| POST | /api/products | Sí (owner/admin) | Crear producto |
| PUT | /api/products/:id | Sí (owner/admin) | Actualizar producto |
| DELETE | /api/products/:id | Sí (owner) | Eliminar producto |
| GET | /api/dashboard | Sí (owner) | Dashboard con estadísticas |
| GET | /api/public/branches | No | Sucursales públicas |
| GET | /api/public/services | No | Servicios públicos |
| GET | /api/public/products | No | Productos públicos |
| GET | /api/public/barbers/:branchId | No | Barberos por sucursal |
| POST | /api/public/appointments | No | Crear cita (guest) |

## Paleta de colores
| Color | Hex | Uso |
|-------|-----|-----|
| Negro | #000000 | Fondo principal |
| Azul | #004B7A | Acentos, botones primarios |
| Rojo | #9B0000 | Acentos, alertas |
| Blanco | #FFFFFF | Texto, fondos alternos |
| Gris | #CFCFCF | Texto secundario |
| Carbón | #1A1A1A | Fondos de cards |
