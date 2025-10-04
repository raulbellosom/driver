# Migración del Sistema de Roles

## Resumen de Cambios

Se ha reestructurado completamente el sistema de autenticación y roles para eliminar la dependencia de Appwrite Teams y usar un sistema basado en el campo `roles` array en la colección `users_profile`.

## ✅ Cambios Implementados

### 1. **Nuevo Campo `roles` Array**

- ✅ El campo `roles` ahora es un array que puede contener múltiples roles: `["root", "admin", "ops", "driver"]`
- ✅ Eliminado el campo `isDriver` (obsoleto)
- ✅ Un usuario puede tener múltiples roles simultáneamente

### 2. **Jerarquía de Roles**

```
root > admin > ops > driver > anonymous
```

- **root**: Acceso completo al sistema, puede gestionar otros roots
- **admin**: Gestión completa de recursos, no puede gestionar roots
- **ops**: Gestión operativa, puede ver/gestionar drivers
- **driver**: Acceso limitado, solo su propia información
- **anonymous**: Sin autenticación

### 3. **Archivos Actualizados**

#### **Hooks Principales:**

- ✅ `src/hooks/useRoles.js` - Nuevo hook principal para gestión de roles
- ✅ `src/hooks/useRole.js` - Alias de compatibilidad
- ✅ `src/hooks/useAuth.jsx` - Actualizado para usar roles array
- ✅ `src/hooks/useAdminStats.js` - Actualizado sin teams

#### **Servicios API:**

- ✅ `src/api/auth.js` - Completamente reescrito sin teams
- ✅ `src/api/users.js` - Actualizado para roles array
- ✅ `src/api/storage.js` - Simplificado sin teams

#### **Componentes:**

- ✅ `src/components/Protected.jsx` - Actualizado para nuevos roles
- ✅ `src/App.jsx` - Actualizado para redirecciones por roles

#### **Configuración:**

- ✅ `src/lib/appwrite.js` - Eliminadas funciones de teams
- ✅ `src/lib/env.js` - Variables de teams comentadas

### 4. **Permisos en Appwrite**

- ✅ Configurar **AllUsers** con CRUD completo en todas las colecciones
- ✅ Control de permisos ahora se hace por código usando el campo `roles`
- ✅ Eliminada dependencia de Teams de Appwrite

## 🔧 Funcionalidades del Nuevo Sistema

### **useRoles() Hook**

```javascript
const {
  // Datos principales
  roles, // Array de roles: ["admin", "ops"]
  primaryRole, // Rol principal: "admin"
  isRoot, // boolean
  isAdmin, // boolean
  isOps, // boolean
  isDriver, // boolean

  // Funciones de permisos
  can, // Objeto con funciones de permisos específicos
  hasRole, // Verificar si tiene rol específico
  hasAnyRole, // Verificar si tiene cualquiera de los roles
  hasAllRoles, // Verificar si tiene todos los roles
  hasPermission, // Verificar permisos por nombre
} = useRoles();
```

### **Funciones de Permisos Disponibles**

```javascript
// Gestión de usuarios
can.createUsers();
can.createAdminUsers();
can.viewAllUsers();
can.editAnyUser();

// Administración
can.accessAdminPanel();
can.manageCompanies();
can.accessSystemSettings();

// Vehículos y viajes
can.manageAllVehicles();
can.manageAllTrips();
can.viewAllReports();
```

### **Componente Protected**

```jsx
// Permitir solo a admins
<Protected allow={["admin"]}>
  <AdminPanel />
</Protected>

// Permitir a ops y superiores
<Protected allow={["ops", "admin", "root"]}>
  <Operations />
</Protected>

// Permitir a todos los roles autenticados
<Protected allow={["driver", "ops", "admin", "root"]}>
  <Profile />
</Protected>
```

## 📝 Validaciones de Seguridad

### **Creación de Usuarios**

- ✅ Root puede crear cualquier rol
- ✅ Admin puede crear admin, ops, driver
- ✅ Ops puede crear solo drivers
- ✅ Validaciones en backend para prevenir escalación de privilegios

### **Actualización de Perfiles**

- ✅ Solo root puede modificar usuarios root
- ✅ Solo admin+ puede modificar usuarios admin
- ✅ Ops solo puede modificar drivers
- ✅ Usuarios pueden actualizar su propio perfil (campos limitados)

### **Control de Acceso**

- ✅ Roles superiores pueden acceder a funcionalidades de roles inferiores
- ✅ Usuarios root nunca aparecen en listados (excepto para otros roots)
- ✅ Filtrado automático de usuarios según permisos del usuario actual

## 🚀 Beneficios del Nuevo Sistema

1. **Flexibilidad**: Un usuario puede tener múltiples roles
2. **Escalabilidad**: Fácil agregar nuevos roles sin cambiar Teams
3. **Seguridad**: Control granular por código, no dependiente de Appwrite Teams
4. **Mantenimiento**: Código más limpio y fácil de mantener
5. **Performance**: Menos llamadas a APIs de Teams de Appwrite

## ⚠️ Consideraciones de Migración

### **Para Usuarios Existentes:**

1. Migrar usuarios existentes agregando el campo `roles` apropiado
2. Los usuarios con `isDriver: true` deben tener `roles: ["driver"]`
3. Los usuarios en team admins deben tener `roles: ["admin"]`

### **En Appwrite Console:**

1. Configurar permisos AllUsers en todas las colecciones
2. Agregar el campo `roles` array a la colección users_profile
3. Opcional: Eliminar Teams si no se usan para otras funcionalidades

## 🔍 Testing y Validación

Para probar el nuevo sistema:

1. **Crear usuarios con diferentes roles**
2. **Verificar permisos de acceso por rol**
3. **Probar escalación y restricciones de permisos**
4. **Validar funcionamiento sin errores 401**
5. **Confirmar que el filtrado de usuarios funciona correctamente**

## 📞 Contacto

Para dudas o problemas con la migración, revisar:

- Logs de consola para errores de permisos
- Campo `roles` en users_profile debe ser array válido
- Configuración AllUsers en Appwrite Console
- Validar que no se hagan referencias a teams obsoletos

---

_Migración completada exitosamente ✅_
