# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

# DriverPro Frontend - Sprint 1 Testing

Frontend de prueba para testear la API del Sprint 1 del proyecto DriverPro basado en Appwrite.

## 🚀 Configuración Inicial

### 1. Variables de Entorno

Copia `.env.example` a `.env` y configura:

```bash
cp .env.example .env
```

Las variables están ya configuradas para tu instancia:

```env
VITE_APPWRITE_ENDPOINT=https://appwrite.racoondevs.com/v1
VITE_APPWRITE_PROJECT_ID=project-default-68d02261001f83754926
VITE_APPWRITE_DATABASE_ID=database-68d02272002bfa34f9bb
VITE_APPWRITE_TEAM_ADMINS_ID=68d03db20015a213f147
VITE_APPWRITE_TEAM_DRIVERS_ID=68d03dc800331db373eb
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Ejecutar en Desarrollo

```bash
npm run dev
```

## 📁 Estructura del Proyecto

```
src/
├── main.jsx              # Entry point con QueryClient y Router
├── App.jsx               # Layout principal con navegación
├── router.jsx            # Configuración de rutas con protección por roles
├── lib/
│   ├── env.js            # Variables de entorno centralizadas
│   └── appwrite.js       # Cliente Appwrite y funciones base
├── hooks/
│   └── useRole.js        # Hook para determinar rol del usuario
├── components/
│   └── Protected.jsx     # Componente para proteger rutas por rol
├── api/
│   ├── me.js            # Endpoints relacionados al usuario
│   └── crud.js          # Endpoints CRUD para Sprint 1
└── pages/
    ├── Home.jsx         # Página principal
    ├── Login.jsx        # Página de login
    ├── TestAPI.jsx      # Página de testing de la API
    ├── Admin.jsx        # Panel administrativo
    ├── Driver.jsx       # Panel de choferes
    └── NotFound.jsx     # Página 404
```

## 🔐 Sistema de Roles

El sistema implementa los roles definidos en el Sprint 1:

- **admin**: Acceso completo (miembros del team `dp_admins`)
- **driver**: Acceso limitado (miembros del team `dp_drivers`)
- **anonymous**: Sin autenticar

## 🧪 Testing de API

### Página `/test-api`

Esta página permite probar los endpoints del Sprint 1:

1. **Health Check**: Verifica que la conexión con Appwrite funcione
2. **Gestión de Marcas**: CRUD básico para `vehicle_brands`
3. **Información de Usuario**: Muestra rol y memberships

### Endpoints Implementados

Según las tareas del Sprint 1:

- ✅ `GET /health` - Health check básico
- ✅ `GET /me` - Perfil del usuario + teams
- ✅ `GET /brands` - Lista de marcas de vehículos
- ✅ `POST /brands` - Crear nueva marca (solo admins)
- ⏳ `GET /models` - Modelos de vehículos (pendiente collections)
- ⏳ `GET /companies` - Empresas (pendiente collections)

## 📋 Tareas del Sprint 1 - Estado

### T1. Teams y Roles ✅

- [x] Teams creados en Appwrite
- [x] IDs configurados en `.env`
- [x] Hook `useRole()` implementado
- [x] Componente `Protected` para rutas

### T2. users_profile ⏳

- [ ] Colección `users_profile` en Appwrite
- [ ] Bootstrap automático post-signup
- [x] Endpoint `/me` básico

### T3. Permisos ACL ⏳

- [ ] Definir permisos por colección
- [ ] Aplicar ACL en Appwrite Console
- [x] Validación por rol en frontend

### T4. Storage & Buckets ⏳

- [ ] Crear buckets en Appwrite
- [ ] Function thumbnailer
- [ ] Tests de upload/download

### T5. Esqueleto DB ⏳

- [ ] Colección `companies`
- [ ] Colección `vehicle_brands`
- [ ] Colección `vehicle_models`
- [x] Endpoints CRUD preparados

### T6. Function API Gateway ⏳

- [ ] Function HTTP en Appwrite
- [ ] Middleware de auth/roles
- [ ] Estándar de respuesta JSON
- [x] Frontend preparado para consumir

### T7. Realtime PoC ⏳

- [ ] Suscripciones a collections
- [ ] Demo de cambios en vivo
- [x] Cliente preparado para Realtime

## 🔄 Próximos Pasos

1. **Crear colecciones en Appwrite Console**:

   - `users_profile`
   - `companies`
   - `vehicle_brands`
   - `vehicle_models`

2. **Actualizar IDs en `.env`**:

   - `VITE_APPWRITE_COLLECTION_BRANDS_ID`
   - `VITE_APPWRITE_COLLECTION_MODELS_ID`

3. **Configurar permisos ACL** en cada colección

4. **Crear Function API Gateway** en Appwrite

5. **Implementar Realtime** para cambios en vivo

## 🛠 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview build
npm run preview

# Lint
npm run lint
```

## 📚 Tecnologías

- **React 19** con JSX
- **Vite 7** como bundler
- **TailwindCSS 4.1** para estilos
- **React Router** para navegación
- **TanStack Query** para estado del servidor
- **Appwrite Web SDK** para backend
- **Zod** para validación (preparado)

---

**Nota**: Este es un frontend de testing para el Sprint 1. La funcionalidad completa depende de la configuración del backend en Appwrite según las tareas definidas.
