
# **DriverPro · Plan de Migración a Appwrite (Backend en tiempo real + PWAs)**

**Versión:** 1.0\
**Fecha:** 21/Sep/2025 (TZ: America/Mexico_City)\
**Autor:** Raul Belloso (Racoon Devs) — con asistencia de ChatGPT

---

## **0) Objetivo**

Migrar/replicar la funcionalidad clave de DriverPro (Odoo + módulo custom) a una **arquitectura en tiempo real** sobre **Appwrite** (Database, Auth, Functions, Realtime, Storage) con **dos clientes web/PWA**:

- **Panel Administrativo** (backoffice): administración total con control fino por roles/permisos.
- **App de Choferes**: interfaz simplificada para viajes, recargas y consultas.

Se trabajará sobre el proyecto/BD: `driverpro_dev`.

---

## **1) Arquitectura & Alcance**

### **1.1 Componentes**

- **Appwrite Core (VPS existente)**: Auth, Database, Functions, Realtime, Storage, Cloud Tasks (cron/schedules).
- **Functions**:
  - **API Orquestadora**: validación, reglas de negocio, agregaciones y compatibilidad estable para clientes.
  - **Workers**: cálculos, cierres contables, generación de reportes, notificaciones, tareas programadas.
- **Realtime**:
  - Canales por colección (e.g., `databases.driverpro_dev.collections.trips`).
  - Canales por entidad (e.g., `...documents.{documentId}`) si se necesita granularidad.
- **Storage**: buckets para documentos, pólizas, imágenes, evidencias, PDFs.
- **PWAs**: Admin y Choferes (React + Vite). Soporte offline selectivo y reconexión.

### **1.2 Seguridad & Acceso**

- **Equipos y Roles (Appwrite Teams)**: `owners`, `admins`, `ops`, `finance`, `dispatch`, `auditors`, `drivers`.
- **Permisos por Documento**: ACL por colección + refuerzos en Functions.
- **PII & Auditoría**: logs de cambios, IP/op, trazabilidad.
- **Principio de menor privilegio**.

### **1.3 Entidades Clave (Colecciones)**

> Los nombres y campos pueden ajustarse durante implementación; se listan mínimo viable + índices básicos.

- **users_profile** (perfil extendido de usuario)
  - `userId` (Appwrite ID, unique, index)
  - `role` (enum: owner, admin, ops, finance, dispatch, auditor, driver)
  - `name`, `phone`, `avatarUrl`
  - `companyId` (multi-tenant opcional)
  - `driver` (bool), `licenseNumber`, `licenseExpiry`
  - `enabled` (bool default true), `createdAt`, `updatedAt`
- **companies**
  - `name`, `rfc`, `address`, `contact`
  - `enabled`, timestamps
- **vehicle_brands**
  - `name` (unique, index), `enabled`
- **vehicle_models**
  - `brandId` (ref), `name`, `year` (int optional), `enabled`
  - Índices: `brandId+name`
- **vehicles**
  - `type` (enum), `brandId`, `modelId`, `plate`, `vin`
  - `acquisitionDate`, `cost`, `mileage` (int), `status` (enum: active, maintenance, inactive, sold)
  - `condition` (enum/opcional: new, semi_new, maintenance, repair, for_sale, rented, etc.)
  - `companyId`, `images[]` (storage refs), `documents[]` (refs a `vehicle_documents`), `enabled`
  - Índices: `plate`, `vin`, `companyId`
- **vehicle_odometers**
  - `vehicleId` (ref), `value` (int), `source` (enum: manual, trip, service), `at` (datetime), `note`
  - Índices: `vehicleId+at`
- **vehicle_documents**
  - `vehicleId`, `type` (enum: insurance_policy, circulation_card, invoice, photo, misc)
  - `file` (storage), `metadata` (json), `validFrom`, `validTo`, `enabled`
- **insurances**
  - `vehicleId`, `policyNumber`, `provider`, `coverage`, `validFrom`, `validTo`, `file` (storage), `enabled`
- **recurring_services** (impuestos, refrendos, verificaciones, mantenimientos programados)
  - `companyId`/`vehicleId` (según aplique), `title`, `type` (enum), `amount`, `currency`
  - `periodicity` (enum: monthly, quarterly, yearly, custom), `nextDueDate`, `reminderDays` (int)
  - `status` (active, paused), `notes`, `enabled`
- **drivers_assignments**
  - `driverUserId`, `vehicleId`, `cardId` (opcional), `from`, `to` (nullable), `enabled`
  - Índices: `driverUserId+to(nulls last)` para asignación activa
- **recharge_cards**
  - `code` (unique), `provider` (enum), `balance` (decimal), `status` (active, blocked, lost), `companyId`
  - Historial se modela aparte
- **recharge_movements**
  - `cardId`, `type` (topup, spend, adjust), `amount`, `currency`, `tripId` (nullable), `at`, `byUserId`, `note`
  - Índices: `cardId+at`
- **trips**
  - `type` (regular, with_card), `status` (draft, searching, assigned, started, finished, cancelled)
  - `driverUserId`, `vehicleId`, `cardId` (si aplica), `origin`, `destination`
  - `scheduledAt` (nullable), `startedAt`, `finishedAt`
  - `fare` (decimal), `currency`, `paymentMethod` (cash, card, transfer, other), `paymentRef` (string)
  - `odometerStart`, `odometerEnd`, `distanceKm` (calc), `notes`
  - Índices: `status`, `driverUserId+status`, `scheduledAt`
- **trip_searches**
  - `requestedByUserId`, `criteria` (json), `status` (open, matched, closed), `createdAt`, `closedAt`
  - `matchedTripId` (nullable)
- **maintenance_reports**
  - `vehicleId`, `reporterUserId`, `category` (service, fault, other)
  - `title`, `description`, `severity` (low, med, high), `status` (open, in_progress, done), `attachments[]`
- **payments**
  - `subjectType` (trip, service, fee), `subjectId`, `amount`, `currency`, `method`, `when`, `note`
- **audits**
  - `who`, `what` (collection), `docId`, `action` (create/update/delete), `diff` (json), `at`, `ip`

> **Nota:** Todas las colecciones deben incluir `enabled: boolean @default(true)` para borrado lógico (alineado a tu modelo actual).

### **1.4 Índices & Búsquedas**

- Búsquedas por placa/VIN, chofer activo, viajes por estado/fecha, tarjetas con saldo, vencimientos próximos.
- Usar **Appwrite Queries** + vistas agregadas vía Functions cuando se requiera.

---

## **2) Plan de Trabajo (5 Sprints)**

> Duración sugerida por sprint: 2 semanas. Ajustable según carga.

### ✅ **Sprint 1 — Fundaciones (Auth, Roles, Seguridad, Storage, Esqueleto DB)**

**Objetivo general:** Tener base segura y mínima para CRUD básicos y tiempo real.

**Tareas**

1. **Definir equipos y roles en Appwrite**

   - *Meta:* Crear Teams: `owners`, `admins`, `ops`, `finance`, `dispatch`, `auditors`, `drivers`.
   - *Criterios de aceptación:*
     - Los usuarios pueden ser añadidos/quitarse de equipos.
     - Las Functions pueden leer el membership del usuario (JWT) para decidir permisos.

2. **Modelo** `users_profile` **y bootstrap de perfiles**

   - *Meta:* Colección `users_profile` con campos clave (role, phone, companyId, driver flags).
   - *Criterios:*
     - Hook/Function post-signup que crea el documento de perfil del usuario.
     - Endpoints para **get/me**, **update/me** con validaciones.

3. **Permisos base por colección**

   - *Meta:* Reglas de lectura/escritura por rol/documento (ACLs).
   - *Criterios:*
     - `drivers` solo ven/editar sus datos y documentos permitidos.
     - `admins`/`owners` acceso amplio; `auditors` solo lectura.

4. **Storage & Buckets**

   - *Meta:* Buckets: `vehicle_docs`, `vehicle_images`, `reports_attachments`, `policies`.
   - *Criterios:*
     - Límites de tamaño/tipo; naming convention; metadata mínima.
     - Thumbnails automáticos (Function) para imágenes.

5. **Funciones base (API Gateway)**

   - *Meta:* Function HTTP con rutas: `/health`, `/me`, `/companies`, `/brands`, `/models` (CRUD mínimo).
   - *Criterios:*
     - Linter, logs estructurados, manejo de errores estándar (`code`, `message`, `details`).

6. **Realtime prueba de concepto**

   - *Meta:* Suscripción a `vehicle_brands` y `vehicle_models`.
   - *Criterios:*
     - Cambios reflejados en un cliente demo en &lt;500 ms en LAN del VPS.

7. **Observabilidad inicial**

   - *Meta:* Dashboards/trazas (Appwrite console + logs Functions).
   - *Criterios:*
     - Correlación de request-id entre Function y cliente.

**Entregables:** Diagrama de roles, colecciones base creadas, Function API mínima, PoC Realtime, README de arranque.

---

### ✅ **Sprint 2 — Núcleo de Flota (Marcas/Modelos/Vehículos/Odómetros/Documentos/Seguros/Servicios Recurrentes)**

**Objetivo general:** Cubrir administración integral de la flota y vencimientos.

**Tareas**

1. **Colecciones** `vehicle_brands` **y** `vehicle_models`

   - *Meta:* CRUD completo con validación (unicidad por marca+modelo+año).
   - *Criterios:* Índices, soft-delete, auditoría.

2. **Colección** `vehicles`

   - *Meta:* CRUD + carga de imágenes + relación con documentos.
   - *Criterios:* Validación de VIN/placa, status/condition, vistas por compañía.

3. **Odómetros (**`vehicle_odometers`**)**

   - *Meta:* Alta rápida, lectura por rango, cálculo de última lectura.
   - *Criterios:* Al crear viaje/terminar viaje, registrar `odometerStart/End` (hook posterior).

4. **Documentos de vehículos (**`vehicle_documents`**) y Seguros (**`insurances`**)**

   - *Meta:* Adjuntos en Storage, fechas de vigencia, recordatorios.
   - *Criterios:* Function programada (cron) que marca **por vencer** (e.g., 15 días).

5. **Servicios recurrentes (**`recurring_services`**)**

   - *Meta:* Crear/pausar/reanudar tareas; calcular `nextDueDate`.
   - *Criterios:* Notificaciones (correo/push) a `ops`/`admins`.

6. **Listas y filtros avanzados (Admin PWA)**

   - *Meta:* Grids con búsqueda por placa/VIN, filtros por estado, etiquetas.
   - *Criterios:* Paginar, ordenar, exportar CSV básico.

**Entregables:** CRUDs completos de flota, cron de vencimientos, vistas admin funcionales.

---

### ✅ **Sprint 3 — Operación con Choferes (Asignaciones, Búsqueda/Viajes, Tarjetas y Recargas, Tiempo Real)**

**Objetivo general:** Flujo operativo end-to-end para choferes y despacho.

**Tareas**

1. **Perfiles de chofer y asignaciones (**`drivers_assignments`**)**

   - *Meta:* Un chofer puede tener **una** asignación activa (vehículo y opcional tarjeta).
   - *Criterios:* Validación de solapamiento; endpoints para asignar/desasignar; vistas en Admin.

2. **Búsqueda de viajes (**`trip_searches`**)**

   - *Meta:* Chofer inicia “búsqueda”; despacho convierte en viaje.
   - *Criterios:* Realtime: al abrir `trip_search`, admin lo ve; conversión crea `trips` con vínculo.

3. **Viajes (**`trips`**) — regular y con tarjeta**

   - *Meta:* Estados: draft → searching → assigned → started → finished/cancelled.
   - *Criterios:* Reglas de transición; validación de `odometerStart/End`; cálculo `distanceKm`.

4. **Tarjetas de recarga (**`recharge_cards`**) y movimientos (**`recharge_movements`**)**

   - *Meta:* Top-ups, gastos por viaje, ajustes; bloqueo/perdida.
   - *Criterios:* Invariantes: `balance = sum(movements)`; evitar saldo negativo (o permitir con flag y auditoría).

5. **Pagos de viaje (**`payments`**)**

   - *Meta:* Registrar método (efectivo/tarjeta/transfer), referencia y conciliación básica.
   - *Criterios:* Validaciones por rol; reporte diario por chofer.

6. **App de Choferes (PWA mínima)**

   - *Meta:* Home con asignación activa, iniciar búsqueda, ver viajes, iniciar/finalizar viaje.
   - *Criterios:* Realtime para cambios de estado; UX offline *read-only* (historial).

**Entregables:** Flujo operativo vivo (tiempo real) + PWA chofer funcional (MVP).

---

### ✅ **Sprint 4 — Reportes, Finanzas y Backoffice Avanzado**

**Objetivo general:** Control y visibilidad financiera/operativa + notificaciones y auditoría.

**Tareas**

1. **Reportes de viajes**

   - *Meta:* Por rango/estado/chofer/vehículo; CSV y vista dashboards.
   - *Criterios:* Agregaciones (via Function) con caching temporal.

2. **Reportes financieros (tarjetas y viajes)**

   - *Meta:* Saldos por tarjeta, consumo por periodo, top-ups vs gastos, ingresos por viaje.
   - *Criterios:* Conciliación diaria/semanal con exportables.

3. **Reportes de choferes**

   - *Meta:* KPIs: viajes/día, puntualidad (si aplica), ingresos/chofer.
   - *Criterios:* Comparativas y ranking simple.

4. **Notificaciones & Recordatorios**

   - *Meta:* Email/push para vencimientos, tareas recurrentes, cambios de estado críticos.
   - *Criterios:* Canal configurable por usuario/rol.

5. **Auditoría & Bitácora (**`audits`**)**

   - *Meta:* Registrar create/update/delete con `diff` mínimo.
   - *Criterios:* Filtros por usuario/colección/fecha; exportable.

6. **Backoffice Admin (UX)**

   - *Meta:* Mejoras en grids, filtros componibles, acciones masivas (pausar servicios, bloquear tarjetas).
   - *Criterios:* Confirmaciones, deshacer (soft-delete), reglas por rol.

**Entregables:** Conjunto de reportes + notificaciones + auditoría + backoffice sólido.

---

### ✅ **Sprint 5 — Endurecimiento, Migración y Salida a Producción**

**Objetivo general:** Calidad, CI/CD, migraciones desde Odoo y cutover seguro.

**Tareas**

1. **QA & Pruebas**

   - *Meta:* Tests unitarios Functions, smoke tests PWAs, pruebas de estrés Realtime.
   - *Criterios:* &gt;80% cobertura en módulos críticos; plan de pruebas UAT por rol.

2. **Seguridad & Compliance**

   - *Meta:* Revisión de permisos por colección y endpoints; rate limiting; validación de entrada.
   - *Criterios:* Escaneo dependencias; secretos en variables; rotación de claves.

3. **Backups & Recuperación**

   - *Meta:* Políticas de backup Appwrite DB/Storage; restauración ensayada.
   - *Criterios:* RPO ≤ 24h; RTO ensayado.

4. **CI/CD**

   - *Meta:* Pipelines para Functions y PWAs (build, lint, test, deploy); versión semántica.
   - *Criterios:* Deploy canario de PWAs; rollback automático.

5. **Migración desde Odoo**

   - *Meta:* Scripts de exportación y mapping; importadores Appwrite (batch).
   - *Criterios:* Validaciones post-import (conteos, checksums, spot-checks funcionales).

6. **Documentación & Onboarding**

   - *Meta:* Manuales por rol (admin/ops/dispatch/finance/driver), runbooks de operación.
   - *Criterios:* Wiki con diagramas y SOPs (incidentes, bloqueo de tarjeta, pérdida de dispositivo, etc.).

**Entregables:** Entorno listo para producción, con CI/CD, backups, y migración ejecutada.

---

## **3) Definiciones Transversales**

### **3.1 Contratos de API (Functions — ejemplo)**

- `GET /me` → perfil + teams
- `GET /vehicles?status=&q=&page=&limit=`
- `POST /vehicles` (valida placa/VIN únicos)
- `POST /trips` (type: regular|with_card)
- `POST /trips/{id}/transition` (assigned|started|finished|cancelled)
- `POST /recharge-cards/{id}/topup`
- `POST /recharge-cards/{id}/spend` (con `tripId`)

**Respuesta estándar:**

```json
{ "ok": true, "data": { ... }, "error": null, "meta": { "requestId": "..." } }
```

Errores:

```json
{ "ok": false, "error": { "code": "VALIDATION_ERROR", "message": "..." } }
```

### **3.2 Reglas de Datos**

- **Soft delete:** `enabled=false` + `deletedAt` (opcional).
- **Timestamps:** `createdAt`, `updatedAt` en todas las colecciones.
- **Consistencia:** invariante de saldo en tarjetas, odómetros crecientes (permitir corrección con auditoría).

### **3.3 Naming & Estándares**

- IDs de ruta en `kebab-case` para Functions, campos en `camelCase`.
- Commits con Conventional Commits; SemVer para releases.
- i18n listo (es/en) en PWAs.

### **3.4 PWA (Admin/Choferes)**

- **Core:** React + Vite, React Query, Router, IndexedDB (cache selectiva), Web Push (cuando aplique).
- **Realtime:** reconexión, optimistic UI en acciones clave (crear búsqueda, asignar viaje).
- **Accesibilidad:** atajos básicos, contrastes, loaders skeleton.

---

## **4) Matriz de Roles → Permisos (resumen)**

| **Recurso** | **owners/admins** | **ops/dispatch** | **finance** | **auditors** | **drivers** |
| --- | --- | --- | --- | --- | --- |
| Users/Profile | CRUD | R | R | R | R/W(me) |
| Companies | CRUD | R | R | R | \- |
| Brands/Models | CRUD | R | \- | R | \- |
| Vehicles | CRUD | R/W(status) | R | R | R(asignados) |
| Odometers | CRUD | R/W | R | R | C(own trip) |
| Vehicle Documents | CRUD | R | R | R | R(asignados) |
| Insurances | CRUD | R | R | R | \- |
| Recurring Services | CRUD | R/W(status) | R | R | \- |
| Drivers Assignments | CRUD | R/W | \- | R | R(own) |
| Trip Searches | CRUD | CRUD | \- | R | C/close(own) |
| Trips | CRUD | CRUD | R | R | C/R/W(own state) |
| Recharge Cards | CRUD | R/W(block) | CRUD | R | \- |
| Recharge Movements | CRUD | R | CRUD | R | \- |
| Payments | CRUD | R | CRUD | R | \- |
| Reports (views) | R | R | R | R | R(own) |
| Audits | R | R | R | R | \- |

---

## **5) Riesgos y Mitigaciones**

- **Concurrencia en saldo de tarjetas** → usar transacciones lógicas vía Function con compare-and-set.
- **Reconexión Realtime en móvil** → colas locales y reintentos exponenciales.
- **Migración de datos** → dry-runs, mapeos documentados, validación cruzada.
- **Privacidad** → separación por companyId, revisión de ACLs por colección.

---

## **6) Checklist de Cierre por Sprint**

- Historias cerradas con criterios de aceptación verificados.
- Pruebas automatizadas/verdes.
- Demo funcional (gif o video corto).
- Documentación actualizada.

---

## **7) Próximos Pasos Inmediatos**

1. Crear Teams y `users_profile` (Sprint 1, Tareas 1 y 2).
2. Montar Function API base con `/me` y `/brands`.
3. Probar Realtime con brands/models en un cliente demo.

---

> **Anexo A — Campos sugeridos por colección (detalle mínimo viable)**

- **vehicle_brands**: `name`, `enabled`, timestamps
- **vehicle_models**: `brandId`, `name`, `year?`, `enabled`, timestamps
- **vehicles**: `companyId`, `type`, `brandId`, `modelId`, `plate`, `vin`, `acquisitionDate?`, `cost?`, `mileage`, `status`, `condition?`, `images[]`, `enabled`, timestamps
- **vehicle_odometers**: `vehicleId`, `value`, `source`, `at`, `note?`, timestamps
- **vehicle_documents**: `vehicleId`, `type`, `file`, `metadata(json)?`, `validFrom?`, `validTo?`, `enabled`, timestamps
- **insurances**: `vehicleId`, `policyNumber`, `provider`, `coverage?`, `validFrom`, `validTo`, `file?`, `enabled`, timestamps
- **recurring_services**: `companyId?/vehicleId?`, `title`, `type`, `amount`, `currency`, `periodicity`, `nextDueDate`, `reminderDays`, `status`, `notes?`, `enabled`, timestamps
- **drivers_assignments**: `driverUserId`, `vehicleId`, `cardId?`, `from`, `to?`, `enabled`, timestamps
- **recharge_cards**: `companyId`, `code`, `provider?`, `status`, `balance(calc)`, `enabled`, timestamps
- **recharge_movements**: `cardId`, `type`, `amount`, `currency`, `tripId?`, `at`, `byUserId`, `note?`, timestamps
- **trips**: `type`, `status`, `driverUserId`, `vehicleId`, `cardId?`, `origin`, `destination`, `scheduledAt?`, `startedAt?`, `finishedAt?`, `fare?`, `currency?`, `paymentMethod?`, `paymentRef?`, `odometerStart?`, `odometerEnd?`, `distanceKm(calc)`, `notes?`, `enabled`, timestamps
- **trip_searches**: `requestedByUserId`, `criteria(json)`, `status`, `createdAt`, `closedAt?`, `matchedTripId?`
- **maintenance_reports**: `vehicleId`, `reporterUserId`, `category`, `title`, `description`, `severity`, `status`, `attachments[]?`, timestamps
- **payments**: `subjectType`, `subjectId`, `amount`, `currency`, `method`, `when`, `note?`, timestamps
- **audits**: `who`, `what`, `docId`, `action`, `diff(json)`, `at`, `ip`

---

**Fin del documento.**