**Resultado esperado del sprint:** base segura y mínima para CRUD básicos y tiempo real, con API orquestadora inicial, buckets, colecciones base y PoC de Realtime + observabilidad. **Entregables del sprint:** diagrama de roles, colecciones base creadas, Function API mínima, PoC Realtime, README de arranque.

---

## T1. Crear **Teams y Roles** en Appwrite

**Descripción:** Alta de equipos `owners`, `admins`, `ops`, `finance`, `dispatch`, `auditors`, `drivers`; documentar IDs y preparar su uso en Functions (JWT). \
**Pasos:**

1. En Console &gt; Auth &gt; Teams: crear los 7 equipos y anotar `$id`.

2. Crear 1 usuario admin y 1 usuario driver de prueba y agregarlos a sus equipos.

3. Documentar matriz “Rol → permisos” a alto nivel (servirá como piedra angular de ACL).

4. Guardar los IDs en `.env` de Functions y PWAs (p.ej. `APPWRITE_TEAM_ADMINS_ID=`).\
   **Criterios de aceptación:**

- Se pueden añadir/quitar usuarios de equipos y reflejarlo vía API.

- Desde una Function, se lee membership (JWT) y se resuelve el rol efectivo. \
  **Entregables:**

- Tabla de equipos con `$id`.

- Capturas o JSON export de Teams.

- Mini diagrama de roles incluido en README.

---

## T2. Colección **users_profile** y bootstrap post-signup

**Descripción:** Colección para perfil extendido (rol, teléfono, companyId, flags de chofer) y Function que la cree al registrarse un usuario. \
**Pasos:**

1. Crear `users_profile` con campos: `userId`, `role`, `name`, `phone`, `avatarUrl`, `companyId?`, `driver:boolean`, `licenseNumber?`, `licenseExpiry?`, `enabled:boolean`, `createdAt`, `updatedAt`.

2. Indexar `userId (unique)` y (opcional) `companyId`.

3. Implementar Function “auth.onCreate” o endpoint `POST /bootstrap-profile` para crear el documento si no existe.

4. Endpoints `/me` (GET) y `/me` (PATCH) (solo update de su propio perfil, validando rol/permiso).\
   **Criterios de aceptación:**

- Un nuevo usuario obtiene su documento `users_profile` automáticamente.

- `GET /me` regresa perfil + teams. `PATCH /me` valida campos permitidos.\
  **Entregables:**

- Esquema exportado de la colección.

- Código de la Function (handler + tests básicos).

- Documentación de endpoints `/me`.\
  (Contrato de API orientativo en tu plan. )

---

## T3. **Permisos base (ACL) por colección** — diseño y aplicación

**Descripción:** Definir y aplicar reglas de lectura/escritura por rol/documento (principio de menor privilegio). \
**Pasos:**

1. Definir política para cada colección base de Sprint 1 (`users_profile`, `companies`, `vehicle_brands`, `vehicle_models`):

   - `admins/owners`: CRUD.

   - `auditors`: Read.

   - `drivers`: sin acceso a catálogos; `users_profile`: R/W (solo own).

2. Implementar permisos por **documento** donde aplique (ej. `users_profile` del propio usuario).

3. Validar desde Functions los “refuerzos” (no confiar solo en el front).\
   **Criterios de aceptación:**

- Un usuario driver no puede leer/editar perfiles ajenos ni catálogos.

- Un admin puede crear/modificar catálogos y perfiles.\
  **Entregables:**

- Tabla ACL (colección × rol × operación).

- Capturas/JSON de reglas aplicadas.

- Tests de acceso (al menos un caso por rol).

---

## T4. **Storage & Buckets** (documentos base y thumbnails)

**Descripción:** Crear buckets: `vehicle_docs`, `vehicle_images`, `reports_attachments`, `policies`; definir límites de tamaño/tipo, metadata y auto-thumbnails. \
**Pasos:**

1. Crear los 4 buckets con naming y `fileTypes` (pdf/jpg/png/webp).

2. ACL por bucket: lectura admins/owners; subida también por admins; (drivers: por ahora no).

3. Function “thumbnailer” que genere previews para imágenes en `vehicle_images`.

4. Probar upload / download con un usuario admin.\
   **Criterios de aceptación:**

- Archivos restringidos según rol.

- Thumbnails generados y accesibles para admins.\
  **Entregables:**

- IDs de buckets documentados.

- Código de Function de thumbnails y README de uso.

---

## T5. **Esqueleto DB** de Sprint 1 (catálogos + companies)

**Descripción:** Crear colecciones mínimas para la API base: `companies`, `vehicle_brands`, `vehicle_models` (con índices). (Campos sugeridos están anexados en tu plan). \
**Pasos:**

1. `companies`: `name`, `rfc`, `address`, `contact`, `enabled`, timestamps.

2. `vehicle_brands`: `name (unique)`, `enabled`, timestamps.

3. `vehicle_models`: `brandId (ref brands)`, `name`, `year?`, `enabled`, timestamps; índice `brandId+name`.

4. Soft delete (`enabled`), timestamps, y convenciones (camelCase). \
   **Criterios de aceptación:**

- Esquemas creados con índices y validaciones básicas.

- Export JSON de esquemas disponible en repo `/infra/schemas`.\
  **Entregables:**

- Export de colecciones (JSON).

- README “Cómo importar los esquemas”.

---

## T6. **Function API (Gateway) mínima**: `/health`, `/me`, `/companies`, `/brands`, `/models`

**Descripción:** Service HTTP (Appwrite Functions) para exponer los CRUD mínimos con validaciones, logs y manejo de errores estándar. \
**Pasos:**

1. Estructura del proyecto (router, middlewares: auth, role-resolver, validator, error-handler).

2. Endpoints:

   - `GET /health` (pong + version + requestId)

   - `GET /me` / `PATCH /me` (usa T2)

   - `GET/POST /companies`

   - `GET/POST /brands`

   - `GET/POST /models` (valida `brandId` existente, unicidad brand+name+year)

3. Estándar de respuesta `{ok,data,error,meta.requestId}` + logs JSON con correlación.

4. Linter/format, scripts NPM, ejemplo de `.env.example`.\
   **Criterios de aceptación:**

- CRUD básicos operativos con ACL de T3.

- Logs con `requestId` y status en cada request.

- Errores con `code/message/details` coherentes.\
  **Entregables:**

- Código de Function + README de deploy.

- Colección de Postman/Insomnia.

- Ejemplos de logs con `requestId`.

---

## T7. **Realtime PoC** (brands/models)

**Descripción:** Suscripción a cambios de `vehicle_brands` y `vehicle_models` y ver reflejo en un cliente demo (&lt;500 ms en LAN del VPS). \
**Pasos:**

1. Mini página (Vite+React) o script Node que liste marcas/modelos y se suscriba al canal.

2. Probar operaciones CRUD desde la Function y observar eventos.

3. Documentar patrón de reconexión y seguridad (solo documentos con permiso).\
   **Criterios de aceptación:**

- Alta/edición/borrado dispara eventos recibidos por el demo.

- Filtrado efectivo por ACL (un driver no ve eventos no permitidos).\
  **Entregables:**

- Demo cliente (código y GIF corto de la PoC).

- Snippets para futuras PWAs.

---

## T8. **Observabilidad inicial**

**Descripción:** Trazas y logs estructurados; correlación `requestId` desde cliente → Function. \
**Pasos:**

1. Middleware que asigne/propague `requestId` (header → contexto).

2. Formato de log JSON (nivel, timestamp, route, userId, teams, requestId, latency, result).

3. Directrices de naming de logs / tags.

4. Documentar cómo ver logs en Console y cómo filtrar por `requestId`.\
   **Criterios de aceptación:**

- Cada request queda correlacionado con al menos 1 entrada de log.

- Guía de troubleshooting en README.\
  **Entregables:**

- Especificación de formato de logs.

- README “Observabilidad básica”.

---

## T9. **Matriz de permisos (Roles → Recursos)** — documento base

**Descripción:** Consolidar en un doc la matriz Rol×Recurso×Operación (versión Sprint 1) como insumo para T3/T6 y futuros sprints. (Tu plan ya trae un resumen más amplio; aquí aterrizamos la versión recortada a colecciones Sprint 1). \
**Pasos:**

1. Extraer de tu matriz global solo los recursos del sprint y precisar operaciones permitidas.

2. Anotar excepciones y “refuerzos” de Function.

3. Incluir ejemplos prácticos (p.ej., “driver no puede crear brand”).\
   **Criterios de aceptación:**

- Documento aprobado y referenciado desde T3 y T6.\
  **Entregables:**

- `docs/permissions-matrix-s1.md`.

---

## T10. **Seed mínimo** (fixtures de prueba)

**Descripción:** Crear scripts para cargar datos mínimos (1 company, 2 brands, 3 models, 1 admin, 1 driver).\
**Pasos:**

1. Script Node/TS que use SDK Appwrite (API key) para poblar `companies`, `vehicle_brands`, `vehicle_models` y crear users (o documentar creación manual si Auth UI).

2. Asignar teams a los usuarios y crear su `users_profile`.

3. Generar `export.json` para reproducibilidad.\
   **Criterios de aceptación:**

- Con un comando/import se generan datos de prueba y perfiles.\
  **Entregables:**

- `scripts/seed.ts` + `data/seed/*.json`.

- Instrucciones en README.

---

## T11. **Políticas y estándares de datos**

**Descripción:** Formalizar reglas transversales: soft-delete (`enabled=false`), timestamps, naming conventions, i18n base. \
**Pasos:**

1. Plantilla de “esquema mínimo” con `enabled`, `createdAt`, `updatedAt`.

2. Documentar camelCase en campos; rutas API en kebab-case.

3. Añadir apartado i18n (es/en) para PWAs.\
   **Criterios de aceptación:**

- Todas las colecciones del sprint cumplen plantilla.\
  **Entregables:**

- `docs/data-standards.md`.

---

## T12. **Repo y README de arranque (infra + functions + demo)**

**Descripción:** Repos (o monorepo) con estructura inicial, scripts y documentación mínima para levantar Functions y demo Realtime.\
**Pasos:**

1. Estructura: `/infra/schemas`, `/functions/gateway`, `/demo/realtime`, `/docs`.

2. Scripts: `npm run dev|build|deploy` (Functions).

3. `.env.example` con `APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID`, `DB_ID=driverpro_dev`, IDs de teams y colecciones del sprint.\
   **Criterios de aceptación:**

- README permite a un tercero levantar gateway y PoC sin fricción.\
  **Entregables:**

- Repos listos + README “Getting Started”.

---

# Dependencias entre tareas

- T1 → (T2, T3, T6, T7)

- T5 → (T3, T6, T7)

- T2 → T6

- T3 → T6, T7

- T6 → T7, T8

- T11 es transversal, se valida al cerrar T5/T6.

- T12 se cierra al final del sprint con todos los IDs/vars reales.

---

# Checklists de “Definition of Done” por tarea (resumen)

- **T1:** 7 teams creados, IDs versionados, 2 usuarios de prueba asignados.

- **T2:** colección + índice únicos, bootstrap funcionando, `/me` OK.

- **T3:** ACL aplicada en 4 colecciones del sprint + tests de acceso.

- **T4:** 4 buckets creados, límites definidos, thumbnailer operativo.

- **T5:** 3 colecciones creadas, índices, soft-delete/timestamps, export JSON.

- **T6:** endpoints activos, estándar de error/response, logs con requestId.

- **T7:** PoC recibe eventos en vivo, captura de pantalla/GIF de prueba.

- **T8:** logs con correlación y guía de troubleshooting.

- **T9:** doc de permisos enlazado por T3/T6.

- **T10:** seed ejecutable y reproducible.

- **T11:** estándares escritos y aplicados.

- **T12:** repos y README verificados por tercero.

*(Este checklist está alineado con “Entregables del Sprint 1” y definiciones transversales de tu plan. )*

---

## Campos sugeridos (para crear rápido las colecciones del Sprint 1)

- **companies:** `name`, `rfc`, `address`, `contact`, `enabled`, `createdAt`, `updatedAt`.

- **vehicle_brands:** `name (unique)`, `enabled`, `createdAt`, `updatedAt`.

- **vehicle_models:** `brandId (ref)`, `name`, `year?`, `enabled`, `createdAt`, `updatedAt` + índice `brandId+name`.

> Nota: el resto de entidades (vehicles, odometers, etc.) son del Sprint 2 en adelante, según tu plan.

---

## Notas para tu **Plane**

- **Tipo:** crea una “Epic” para el Sprint 1 y 12 “Issues” (T1–T12).

- **Labels sugeridas:** `appwrite`, `auth`, `acl`, `db`, `storage`, `functions`, `realtime`, `observability`, `docs`, `seed`.

- **Prioridad sugerida:** T1, T5, T3, T2, T6, T7, T8, T11, T10, T12, T9, T4 (puedes ajustar).

- **Bloqueadores típicos:** IDs reales de Teams/DB/Buckets; API key para seed; variable `APPWRITE_PROJECT_ID`.

Si quieres, en el siguiente paso te genero:

1. **Export JSON** de los 3 esquemas (`companies`, `vehicle_brands`, `vehicle_models`).

2. **Estructura base del repo** (carpetas, `package.json`, scripts) y el handler de la Function con `/health`, `/me`, `/brands`, `/models`.

3. Un **mini cliente demo** (Vite) para escuchar Realtime en `brands/models`.

Así mantienes el Sprint 1 completamente “copiar–pegar–correr”, fiel a tu plan.