# Documento de Evidencia — LIGUS BARBER

## 1. Modelo de Datos

### Entidad 1: Servicios (Service)

Representa los servicios que ofrece la barbería (cortes, arreglo de barba, etc.).

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| name | String | Sí | Nombre del servicio (ej: "Corte Ligus") |
| description | String | No | Descripción detallada del servicio |
| price | Number | Sí | Precio en pesos mexicanos (mínimo 0) |
| duration | Number | Sí | Duración en minutos (mínimo 5) |
| image | String | No | URL de imagen del servicio |
| branches | [ObjectId → Branch] | No | Sucursales donde está disponible |
| barbers | [ObjectId → User] | No | Barberos que pueden realizarlo |
| isActive | Boolean | No | Soft delete (default: true) |
| createdAt | Date | Auto | Timestamp de creación |
| updatedAt | Date | Auto | Timestamp de última actualización |

### Entidad 2: Sucursales (Branch)

Representa cada local físico de LIGUS BARBER.

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| name | String | Sí | Nombre de la sucursal (ej: "LIGUS Centro") |
| address | String | Sí | Dirección completa |
| phone | String | Sí | Teléfono de contacto |
| schedule.open | String | No | Hora de apertura (default: 09:00) |
| schedule.close | String | No | Hora de cierre (default: 20:00) |
| schedule.days | [Number] | No | Días activos (0=Dom, 6=Sáb, default: Lun-Sáb) |
| image | String | No | URL de imagen de la sucursal |
| isActive | Boolean | No | Soft delete (default: true) |
| createdAt | Date | Auto | Timestamp de creación |
| updatedAt | Date | Auto | Timestamp de última actualización |

### Otras entidades del sistema

- **User**: Usuarios del sistema (owner, admin, barbero, cliente). Email único, contraseña hasheada con bcrypt.
- **Appointment**: Citas agendadas. Referencia a User (client), User (barber), Branch y Service.
- **Product**: Productos en venta. Referencia a Branch.

---

## 2. Relación entre Entidades

### Tipo de relación: Referencia ObjectId (Foreign Key)

La relación principal es entre **Servicios** y **Sucursales**. Es una relación **muchos a muchos**: un servicio puede estar disponible en múltiples sucursales, y una sucursal puede ofrecer múltiples servicios.

En Mongoose esto se implementa como un array de referencias ObjectId en el campo `branches` del modelo Service:

```javascript
branches: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
  }
]
```

### Justificación de por qué se eligió referencia ObjectId

Se eligió referencia ObjectId en lugar de documento embebido por las siguientes razones:

1. **Los datos cambian independientemente**: La información de una sucursal (dirección, horario, teléfono) se actualiza sin necesidad de modificar los servicios. Si estuvieran embebidos, habría que actualizar cada copia de la sucursal en cada servicio.

2. **Consultas cruzadas**: Se necesitan consultas en ambas direcciones — buscar todos los servicios de una sucursal específica, y buscar en qué sucursales está disponible un servicio. Con referencias ObjectId, Mongoose permite populate() para resolver las referencias en ambas direcciones.

3. **Evita duplicación**: Si un servicio está disponible en 3 sucursales, no se duplica la información de cada sucursal. Solo se almacenan los IDs de referencia.

4. **Integridad referencial**: Mongoose valida que los ObjectId referenciados existan, manteniendo la consistencia de los datos.

### Diagrama de relaciones

```
User (client) ──────┐
                    │
User (barber) ──────┤
                    │
Branch ─────────────┼──── Appointment ──── Service
                    │         │                │
                    │         └── price        │
                    │                          │
Branch ─────────────┴──── Product             │
                                              │
Branch <────────────── Service (branches[]) ──┘
```

---

## 3. CRUD Paso a Paso: Crear un Servicio

### Flujo completo desde "Guardar" hasta MongoDB

#### Paso 1: El usuario llena el formulario (Frontend)

En la página `AdminServicios.jsx`, el usuario hace clic en "Nuevo Servicio" y completa:
- Nombre: "Corte Premium"
- Descripción: "Corte de cabello con lavado y masaje"
- Precio: 350
- Duración: 45 minutos
- Sucursales: selecciona "LIGUS Centro" y "LIGUS Norte"

#### Paso 2: Validación frontend

Antes de enviar, el frontend valida:
```javascript
// AdminServicios.jsx - validación antes del submit
if (!formData.name.trim()) {
  toast.error('El nombre es obligatorio');
  return;
}
if (!formData.price || formData.price < 0) {
  toast.error('El precio debe ser mayor a 0');
  return;
}
if (!formData.duration || formData.duration < 5) {
  toast.error('La duración mínima es 5 minutos');
  return;
}
```

#### Paso 3: Llamada a la API (Frontend → Backend)

El frontend envía una petición POST con el token JWT:
```javascript
// api.js
api.services.create({
  name: 'Corte Premium',
  description: 'Corte de cabello con lavado y masaje',
  price: 350,
  duration: 45,
  branches: ['id_sucursal_centro', 'id_sucursal_norte']
})
```

El interceptor de axios agrega automáticamente el header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

#### Paso 4: Middlewares del Backend

La petición pasa por dos middlewares en `serviceRoutes.js`:
1. **protect**: Verifica el token JWT, busca el usuario en MongoDB, lo adjunta a `req.user`
2. **authorize('owner', 'admin')**: Verifica que el usuario tenga rol de owner o admin

Si alguno falla, retorna 401 o 403 y la petición no continúa.

#### Paso 5: Validación con express-validator

```javascript
// serviceRoutes.js
body('name').notEmpty(),
body('price').isFloat({ min: 0 }),
body('duration').isInt({ min: 5 }),
validate, // Middleware que verifica errores de validación
```

Si la validación falla, retorna 400 con los errores específicos.

#### Paso 6: Controlador (Backend)

```javascript
// serviceController.js
exports.createService = async (req, res, next) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json({
      success: true,
      data: service,
      message: 'Servicio creado correctamente',
    });
  } catch (error) {
    next(error);
  }
};
```

#### Paso 7: Mongoose valida y guarda en MongoDB

`Service.create(req.body)` ejecuta:
1. **Validación del schema**: Verifica que `name` sea string y no vacío, `price` sea número ≥ 0, `duration` sea número ≥ 5
2. **Cast de ObjectId**: Convierte los strings de `branches` a ObjectId válidos
3. **INSERT en MongoDB**: Inserta el documento en la colección `services`

#### Paso 8: MongoDB confirma la inserción

MongoDB retorna el documento insertado con su `_id` generado automáticamente:
```json
{
  "_id": "6a2795188da6f0f0ad66af01",
  "name": "Corte Premium",
  "description": "Corte de cabello con lavado y masaje",
  "price": 350,
  "duration": 45,
  "branches": ["6a2795178da6f0f0ad66aee9", "6a2795178da6f0f0ad66aeea"],
  "isActive": true,
  "createdAt": "2026-06-09T04:22:48.907Z",
  "updatedAt": "2026-06-09T04:22:48.907Z",
  "__v": 0
}
```

#### Paso 9: Respuesta al Frontend

El controlador retorna HTTP 201 con el servicio creado. El frontend:
1. Muestra toast de éxito: "Servicio creado correctamente"
2. Actualiza la lista de servicios (refetch desde MongoDB)
3. Cierra el modal de creación

#### Paso 10: Persistencia verificada

Al recargar la página, el frontend vuelve a llamar `GET /api/services` y MongoDB retorna todos los servicios incluyendo el recién creado. **El dato persiste porque está guardado en MongoDB, no en memoria.**

---

## 4. Uso de IA en el Proyecto

### Herramienta utilizada

Se utilizó **Claude (Anthropic)** a través de la plataforma **OpenCode** como asistente de desarrollo durante todo el proyecto.

### Para qué se usó

1. **Generación de código**: Modelos de Mongoose, rutas de Express, controladores, componentes React, middleware de autenticación
2. **Arquitectura**: Decisiones de estructura del proyecto (MVC, separación frontend/backend, patrón de servicios)
3. **Seed data**: Creación del script de seed con datos realistas de Culiacán, México
4. **Depuración**: Diagnóstico de errores (500 en rutas públicas, contraseñas no hasheadas en insertMany)
5. **Validaciones**: Agregado de validaciones de frontend (regex email, password mínimo, campos requeridos)
6. **Documentación**: Redacción del README y este documento de evidencia

### Decisión donde NO se siguió a la IA

La IA最初amente建议使用 **MongoDB Atlas** (base de datos en la nube) para la conexión. Sin embargo, se decidió usar **MongoDB local** (`mongodb://localhost:27017/ligus-barber`) por las siguientes razones:

1. **Aprendizaje**: Al tener la base de datos local, se puede inspeccionar directamente con MongoDB Compass y entender mejor cómo funcionan las colecciones
2. **Velocidad**: La conexión local es más rápida durante el desarrollo
3. **Control**: Se tiene control total sobre los datos sin depender de un servicio externo

Esta decisión no afecta la funcionalidad del proyecto — la conexión está configurada a través de variables de entorno (`MONGODB_URI`), por lo que cambiar a Atlas solo requiere modificar el archivo `.env`.

Otra decisión propia fue el **diseño del flujo de agendar cita** en 7 pasos. La IA最初amentesugirió un formulario simple de un solo paso, pero se implementó un wizard multi-paso con calendario horizontal y selector de horarios para mejorar la experiencia de usuario, similar a la plataforma AgendaPro que sirvió como inspiración.

---

## 5. Capturas de Pantalla

> **Nota**: Cada captura debe mostrar la barra de direcciones del navegador (o la URL visible) para demostrar que es real y no una imagen editada.

---

### 5.1 Login con usuario demo

**Qué mostrar**: La pantalla de login con las credenciales del usuario demo.

**Pasos**:
1. Abrí la aplicación en el navegador (localhost:3000 o la URL de Vercel)
2. Hacé clic en "Iniciar Sesión"
3. En el campo de correo escribí: `demo@demo.com`
4. En el campo de contraseña escribí: `Demo1234`
5. **Antes de hacer clic en "Ingresar"**, tomá la primera captura (mostrando las credenciales ingresadas)
6. Hacé clic en "Ingresar"
7. Tomá la segunda captura después de que redirija a la página principal (mostrando que entraste como cliente)

[INSERTAR CAPTURA AQUÍ]

---

### 5.2 Formulario de creación y listado con el nuevo registro

**Qué mostrar**: El formulario de creación de una entidad y luego el listado mostrando el registro creado.

**Pasos**:
1. Logueate como propietario: `duenoligus@gmail.com` / `Ligus2024!`
2. Andá a "Servicios" en el menú lateral
3. Hacé clic en "Nuevo Servicio"
4. Completá el formulario con estos datos:
   - Nombre: `Corte Premium`
   - Descripción: `Corte de cabello con lavado y masaje`
   - Precio: `350`
   - Duración: `45`
5. **Tomá captura del formulario completo** (antes de guardar)
6. Hacé clic en "Guardar"
7. **Tomá captura del listado** mostrando el nuevo servicio "Corte Premium" apareciendo en la tabla

[INSERTAR CAPTURA AQUÍ]

---

### 5.3 Persistencia después de recargar

**Qué mostrar**: Que el dato creado persiste en MongoDB después de recargar la página.

**Pasos**:
1. Dejá la página de Servicios abierta (donde se ve "Corte Premium")
2. Presioná **F5** o el botón de recargar del navegador
3. Esperá a que se cargue la página completa
4. **Tomá captura** mostrando que "Corte Premium" sigue apareciendo en el listado

Esto demuestra que el dato está guardado en MongoDB, no en memoria.

[INSERTAR CAPTURA AQUÍ]

---

### 5.4 Edición de un registro

**Qué mostrar**: El formulario de edición con datos modificados y el cambio reflejado en el listado.

**Pasos**:
1. En el listado de Servicios, encontrá "Corte Premium"
2. Hacé clic en el ícono de editar (lápiz) de esa fila
3. Cambiá el precio de `350` a `400`
4. **Tomá captura del formulario** con el precio modificado
5. Hacé clic en "Guardar"
6. **Tomá captura del listado** mostrando el precio actualizado a $400

[INSERTAR CAPTURA AQUÍ]

---

### 5.5 Borrado de un registro

**Qué mostrar**: El diálogo de confirmación y el registro eliminado del listado.

**Pasos**:
1. En el listado de Servicios, encontrá "Corte Premium"
2. Hacé clic en el ícono de eliminar (basura) de esa fila
3. Aparecerá un diálogo de confirmación "¿Estás seguro de eliminar...?"
4. **Tomá captura del diálogo de confirmación**
5. Hacé clic en "Eliminar"
6. **Tomá captura del listado** mostrando que "Corte Premium" ya no aparece

[INSERTAR CAPTURA AQUÍ]

---

### 5.6 Versión de MongoDB 7.0.x

**Qué mostrar**: La versión de MongoDB confirmada en Compass o Atlas.

**Opción A — MongoDB Compass (local)**:
1. Abrí MongoDB Compass
2. Conectate a `mongodb://localhost:27017`
3. En la pantalla principal o en la pestaña de servidor, se muestra la versión (ej: "7.0.x")
4. **Tomá captura** donde se vea la versión

**Opción B — MongoDB Atlas (nube)**:
1. Andá a [cloud.mongodb.com](https://cloud.mongodb.com)
2. Entrá a tu cuenta
3. Seleccioná tu cluster
4. Andá a la pestaña "Overview" o "Deployment > Database"
5. Se muestra la versión de MongoDB
6. **Tomá captura** donde se vea la versión "7.0.x"

[INSERTAR CAPTURA AQUÍ]

---

### 5.7 Colección con documentos reales en MongoDB

**Qué mostrar**: Una colección de MongoDB con documentos reales creados por la aplicación.

**Pasos**:
1. En MongoDB Compass, conectate a tu base de datos
2. Seleccioná la base `ligus-barber`
3. Expandí la lista de colecciones
4. Hacé clic en la colección `services` (o `branches`, `appointments`)
5. Se muestran los documentos con todos sus campos
6. **Tomá captura** donde se vean al menos 2-3 documentos con sus campos visibles (name, price, branches con ObjectId, etc.)

[INSERTAR CAPTURA AQUÍ]

---

### 5.8 URL pública funcionando

**Qué mostrar**: La aplicación desplegada en Vercel accesible desde internet.

**Pasos**:
1. Después de desplegar en Vercel, abrí la URL que te dio (ej: `https://ligus-barber.vercel.app`)
2. Verificá que la página principal carga correctamente
3. **Tomá captura** mostrando la URL en la barra de direcciones y la aplicación funcionando
4. También podés capturar el login con `demo@demo.com` en la URL pública

[INSERTAR CAPTURA AQUÍ]

---

## 6. Credenciales de Prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| **Demo (Cliente)** | **demo@demo.com** | **Demo1234** |
| Propietario | duenoligus@gmail.com | Ligus2024! |
| Admin Centro | admincentro@gmail.com | Admin2024! |
| Admin Norte | adminnorte@gmail.com | AdminNorte2024! |
| Barbero | rodcarlos@gmail.com | Barber2024a! |
| Cliente | perjuan@gmail.com | Client2024! |

---

## 7. Stack Tecnológico

- **Frontend**: React 18 + Vite 5 + Tailwind CSS 3 + Axios + React Router DOM 6 + Recharts
- **Backend**: Express.js 4 + Mongoose 8 + JWT + bcryptjs
- **Base de datos**: MongoDB 7.0.x (local o Atlas)
- **Autenticación**: JWT (JSON Web Tokens) con bcrypt (12 rounds) para hash de contraseñas
