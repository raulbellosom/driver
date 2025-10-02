# 🚛 DriverPro — Frontend Arquitectura

**DriverPro Frontend** es un ecosistema de **dos aplicaciones web progresivas (PWAs)** construidas con **React + Vite**, diseñadas para la gestión integral de flotas vehiculares en tiempo real.  
El sistema conecta **administradores** con **conductores** en un modelo operativo completo que abarca desde la gestión de vehículos hasta el seguimiento de viajes y recargas.

---

## 🚀 Stack Principal

- **React + Vite (JavaScript)** — SPAs rápidas y modulares
- **TailwindCSS** — Sistema de diseño utilitario y consistente
- **Framer Motion** — Animaciones fluidas y micro-interacciones
- **Lucide React** — Librería de íconos coherente y moderna
- **TanStack Query** — Gestión de estado del servidor y cache inteligente
- **React Router** — Navegación declarativa con rutas protegidas
- **Appwrite SDK** — Backend-as-a-Service (Auth, DB, Realtime, Storage, Functions)

---

## 🏗 Arquitectura del Sistema

### **Aplicaciones**

1. **Panel Administrativo** (`/admin/*`) - Gestión completa de flota
2. **App de Conductores** (`/driver/*`) - Interfaz operativa simplificada

### **Integración Backend**

- **Appwrite Core** - Autenticación, base de datos, storage
- **Functions Gateway** - API orquestadora con validaciones de negocio
- **Realtime** - Actualizaciones en vivo (trips, assignments, searches)
- **Teams & Permissions** - Control granular por roles (dp_admins, dp_drivers)

---

## 📂 Estructura de Carpetas

```
/src
  /api
    auth.js
    crud.js
    me.js
    storage.js
  /assets
    /images
    /icons
    /animations
  /components
    /common
      Button.jsx
      Modal.jsx
      DataTable.jsx
      SearchInput.jsx
      StatusBadge.jsx
    /layout
      Navbar.jsx
      Sidebar.jsx
      Footer.jsx
    /forms
      CreateUserModal.jsx
      VehicleForm.jsx
      TripForm.jsx
    /realtime
      RealtimeStatus.jsx
      NotificationBell.jsx
  /hooks
    useRole.js
    useRealtime.js
    usePermissions.js
    useDebounce.js
  /lib
    appwrite.js
    env.js
    realtime.js
    permissions.js
  /pages
    /admin
      Dashboard.jsx
      UsersManagement.jsx
      VehiclesManagement.jsx
      TripsManagement.jsx
      ReportsView.jsx
    /driver
      DriverDashboard.jsx
      MyTrips.jsx
      SearchTrip.jsx
      MyVehicle.jsx
    /shared
      Login.jsx
      Register.jsx
      Profile.jsx
      NotFound.jsx
  /router.jsx
  /styles
    index.css
    components.css
  /utils
    formatters.js
    validators.js
    constants.js
```

---

## 📁 Descripción Detallada

### **`/api`**

Capa de comunicación con **Appwrite** y **Functions Gateway**.

- **`auth.js`** - Autenticación, registro, gestión de perfiles y teams
- **`crud.js`** - Operaciones CRUD para entidades principales
- **`me.js`** - Endpoints específicos del usuario autenticado
- **`storage.js`** - Gestión de archivos (avatares, documentos, imágenes)

### **`/assets`**

Recursos estáticos organizados por tipo.

- **`images/`** - Logos, placeholders, ilustraciones
- **`icons/`** - SVGs personalizados complementarios a Lucide
- **`animations/`** - Lottie files para loaders y estados

### **`/components`**

Componentes reutilizables organizados por propósito.

#### **`common/`**

Componentes base del design system:

- `Button.jsx` - Botones con variantes (primary, secondary, danger)
- `Modal.jsx` - Modal base con overlay y animaciones
- `DataTable.jsx` - Tabla con paginación, ordenamiento y filtros
- `SearchInput.jsx` - Campo de búsqueda con debounce
- `StatusBadge.jsx` - Badges para estados (active, pending, finished)

#### **`layout/`**

Estructura principal de navegación:

- `Navbar.jsx` - Barra superior con notificaciones y perfil
- `Sidebar.jsx` - Navegación lateral adaptativa por rol
- `Footer.jsx` - Pie de página con información del sistema

#### **`forms/`**

Formularios especializados por dominio:

- `CreateUserModal.jsx` - Creación de usuarios (solo admins)
- `VehicleForm.jsx` - Alta/edición de vehículos
- `TripForm.jsx` - Creación y gestión de viajes

#### **`realtime/`**

Componentes de comunicación en tiempo real:

- `RealtimeStatus.jsx` - Indicador de conexión Realtime
- `NotificationBell.jsx` - Centro de notificaciones en vivo

### **`/hooks`**

Hooks personalizados para lógica reutilizable.

- **`useRole.js`** - Gestión de roles y permisos basado en teams
- **`useRealtime.js`** - Suscripciones a eventos en tiempo real
- **`usePermissions.js`** - Validación granular de permisos
- **`useDebounce.js`** - Debounce para búsquedas y validaciones

### **`/lib`**

Configuración y utilidades del sistema.

- **`appwrite.js`** - Cliente configurado de Appwrite
- **`env.js`** - Variables de entorno con validación
- **`realtime.js`** - Manager de conexiones Realtime
- **`permissions.js`** - Matriz de permisos por rol y recurso

### **`/pages`**

Vistas organizadas por aplicación y flujo.

#### **`admin/`** - Panel Administrativo

- `Dashboard.jsx` - Overview general con KPIs y accesos rápidos
- `UsersManagement.jsx` - CRUD completo de usuarios y roles
- `VehiclesManagement.jsx` - Gestión integral de flota
- `TripsManagement.jsx` - Supervisión y asignación de viajes
- `ReportsView.jsx` - Dashboard de reportes y analytics

#### **`driver/`** - App de Conductores

- `DriverDashboard.jsx` - Home del conductor con asignación activa
- `MyTrips.jsx` - Historial y viajes activos del conductor
- `SearchTrip.jsx` - Iniciar búsqueda de viajes disponibles
- `MyVehicle.jsx` - Información del vehículo asignado

#### **`shared/`** - Páginas comunes

- `Login.jsx` - Autenticación con redirección por rol
- `Register.jsx` - Registro con bootstrap automático de perfil
- `Profile.jsx` - Gestión de perfil personal
- `NotFound.jsx` - Página 404 personalizada

### **`/router.jsx`**

Configuración central de rutas con protección por roles.

```jsx
// Rutas protegidas por rol
/admin/*     → require: ["admin"]
/driver/*    → require: ["driver", "admin"]
/profile     → require: ["admin", "driver"]

// Rutas públicas
/login, /register → PublicOnly component
/, /test-api → Públicas
```

### **`/styles`**

Estilos globales y del sistema de diseño.

- **`index.css`** - Reset, variables CSS y utilidades base
- **`components.css`** - Estilos específicos de componentes custom

### **`/utils`**

Funciones auxiliares y constantes del sistema.

- **`formatters.js`** - Formateo de fechas, monedas, distancias
- **`validators.js`** - Validaciones de formularios (VIN, placas, emails)
- **`constants.js`** - Estados, tipos de vehículos, métodos de pago

---

## 🔐 Sistema de Roles y Permisos

### **Roles Principales**

1. **Admin** (`dp_admins` team)

   - Acceso completo al sistema
   - Gestión de usuarios y flota
   - Visualización de todos los reportes

2. **Driver** (`dp_drivers` team)
   - Acceso limitado a funciones operativas
   - Gestión de viajes propios
   - Consulta de vehículo asignado

### **Matriz de Permisos por Vista**

| **Vista**           | **Admin**    | **Driver**      |
| ------------------- | ------------ | --------------- |
| `/admin/users`      | ✅ CRUD      | ❌              |
| `/admin/vehicles`   | ✅ CRUD      | ❌              |
| `/admin/trips`      | ✅ Ver todos | ❌              |
| `/driver/dashboard` | ✅           | ✅              |
| `/driver/trips`     | ✅ Ver todos | ✅ Solo propios |
| `/profile`          | ✅           | ✅              |

---

## ⚡ Sistema Realtime

### **Suscripciones por Rol**

#### **Administradores**

```javascript
// Supervisión global
databases.{DB_ID}.collections.trips
databases.{DB_ID}.collections.trip_searches
databases.{DB_ID}.collections.recharge_movements
```

#### **Conductores**

```javascript
// Solo datos propios
databases.{DB_ID}.collections.trips.documents.{trip-where-driver-is-user}
databases.{DB_ID}.collections.driver_assignments.documents.{user-assignment}
```

### **Eventos Clave**

- **Trip State Changes** - Estados de viaje en tiempo real
- **Driver Assignments** - Asignaciones/reasignaciones de vehículos
- **Search Requests** - Nuevas búsquedas de viajes
- **Card Balance Updates** - Movimientos de tarjetas de recarga

---

## 🎨 Design System

### **Colores Principales**

```css
/* Tema DriverPro */
--primary: #2563eb; /* Blue-600 */
--primary-dark: #1d4ed8; /* Blue-700 */
--success: #059669; /* Emerald-600 */
--warning: #d97706; /* Amber-600 */
--danger: #dc2626; /* Red-600 */
--gray: #6b7280; /* Gray-500 */
```

### **Tipografía**

- **Headings**: Inter Bold (h1-h3)
- **Body**: Inter Regular (párrafos, labels)
- **Code/Data**: JetBrains Mono (tablas, códigos)

### **Componentes Base**

```jsx
// Botones con variantes
<Button variant="primary|secondary|danger" size="sm|md|lg">

// Estados con badges
<StatusBadge status="active|pending|finished|cancelled">

// Tablas con funcionalidades
<DataTable data={} columns={} searchable sortable paginated>
```

---

## ⚙️ Scripts Principales

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo (puerto 5173)
npm run dev:host     # Servidor accesible desde red local

# Calidad
npm run lint         # ESLint + Prettier
npm run type-check   # Verificación de tipos (si usamos TypeScript)
npm run test         # Jest + React Testing Library

# Producción
npm run build        # Build optimizado para producción
npm run preview      # Preview del build local
npm run deploy       # Deploy a staging/production
```

---

## 📊 Métricas y Observabilidad

### **Performance**

- **Core Web Vitals** monitoreados
- **Bundle size** < 1MB inicial
- **Time to Interactive** < 3s
- **Offline functionality** para consultas básicas

### **Logging**

```javascript
// Logs estructurados para debugging
console.log("[AUTH] User login successful", { userId, role, timestamp });
console.error("[REALTIME] Connection failed", { error, retryCount });
```

### **Analytics**

- **User flows** por rol (admin vs driver)
- **Feature usage** (most used views, actions)
- **Performance** (load times, API response times)

---

## 🚧 Estados de Desarrollo

### ✅ **Sprint 1 - COMPLETADO**

- [x] Sistema de autenticación y roles
- [x] Rutas protegidas
- [x] Componentes base
- [x] Realtime proof of concept
- [x] Panel administrativo básico

### 🔄 **Sprint 2 - EN PROGRESO**

- [ ] Gestión completa de vehículos
- [ ] CRUD de marcas y modelos
- [ ] Sistema de documentos y seguros
- [ ] Recordatorios automáticos

### 📋 **Sprint 3 - PLANIFICADO**

- [ ] App de conductores (PWA)
- [ ] Gestión de viajes en tiempo real
- [ ] Sistema de tarjetas y recargas
- [ ] Búsqueda y asignación de viajes

### 📈 **Sprint 4 - FUTURO**

- [ ] Dashboard de reportes avanzados
- [ ] Sistema de notificaciones push
- [ ] Módulo financiero completo
- [ ] Auditoría y trazabilidad

### 🚀 **Sprint 5 - PRODUCCIÓN**

- [ ] Optimización y testing QA
- [ ] CI/CD pipelines
- [ ] Migración de datos Odoo
- [ ] Documentación de usuario

---

## 🔗 Links Útiles

- **Repositorio**: `https://github.com/racoondevs/driverpro-frontend`
- **Staging**: `https://staging.driverpro.app`
- **Design System**: `https://storybook.driverpro.app`
- **API Docs**: `https://api.driverpro.app/docs`

---

## 🏆 Próximos Hitos

### **Inmediatos (2 semanas)**

- Completar CRUD de vehículos con documentación
- Implementar sistema de vencimientos automáticos
- Crear vistas de reportes básicos

### **Mediano plazo (1 mes)**

- PWA de conductores completamente funcional
- Sistema de viajes en tiempo real operativo
- Integración con tarjetas de recarga

### **Largo plazo (3 meses)**

- Sistema completo en producción
- Migración exitosa desde Odoo
- Métricas y analytics funcionando

---

**DriverPro Frontend** está diseñado para ser **escalable, mantenible y centrado en el usuario**, proporcionando una experiencia fluida tanto para administradores como para conductores en la gestión diaria de operaciones de flota.
