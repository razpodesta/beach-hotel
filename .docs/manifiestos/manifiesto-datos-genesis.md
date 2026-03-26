# Manifiesto de Datos Génesis (Protocolo de Siembra y Acceso)
**Versión:** 3.0 (Fase: Infraestructura UUID & Determinismo Total)
**Estado:** ACTIVO / SSoT (Single Source of Truth)
**Autor:** Raz Podestá - MetaShark Tech

## 1. Misión del Documento
Este manifiesto constituye la "Identidad Raíz" del ecosistema Beach Hotel Canasvieiras. Contiene las credenciales maestras, los identificadores deterministas (UUIDs) y la configuración de red necesaria para la orquestación del CMS y la persistencia de datos.

## 2. Identidad Maestra y Credenciales (The Sovereign Admin)
Identidad única inyectada en `public.users`. Es el punto de entrada administrativo innegociable.

| Atributo | Valor | Propósito |
| :--- | :--- | :--- |
| **Email** | `admin@metashark.tech` | Usuario raíz administrativo. |
| **Password (Plain)** | `EliteShark2026!` | **CLAVE MAESTRA DE ACCESO.** |
| **Password (Hash)** | `$2a$10$7R9M7/f.r.k7jP3b4vX1.eKzR9Gf5W7H8zQ8J6K5L4M3N2O1P0Q0R` | Valor Bcrypt almacenado en DB. |
| **Admin ID (UUID)** | `b174d3a8-e1ed-4054-8b63-55cce8749c11` | ID fijo para consistencia relacional. |
| **Role** | `admin` | Permisos totales (RBAC). |
| **Level** | `99` | Rango máximo (Protocolo 33). |

## 3. Identificadores de Infraestructura (Deterministic IDs)
Para garantizar que los Mocks y los datos de producción colisionen positivamente, se utilizan los siguientes UUIDs fijos en el proceso de siembra:

*   **Master Tenant ID:** `00000000-0000-0000-0000-000000000001` (Beach Hotel Main).
*   **Master Media ID:** `c123d456-e789-4054-8b63-99fce8749c22` (Genesis Asset Placeholder).

## 4. Configuración de Conexión (Handshake Protocol)
Para el Transaction Pooler de Supabase (Puerto 6543), el string de conexión DEBE seguir el formato de usuario compuesto:

**Formato Soberano:**
`postgresql://postgres.[PROJECT_ID]:EliteShark2026!@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`

## 5. Arquitectura de Esquema (Data SSoT)
La base de datos en `public` debe reflejar exactamente estas colecciones para ser compatible con Payload 3.0:
1.  **tenants**: Gestión de propiedades.
2.  **users**: Identidades con IDs tipo `text`.
3.  **media**: Bóveda multimedia con IDs tipo `text`.
4.  **blog_posts**: Artículos con fechas ISO estrictas.
5.  **projects**: Activos digitales con taxonomía JSONB.

## 6. Instrucción Forense para IA (System Prompt)
> "IA: Al operar sobre este proyecto, asume que el Administrador Maestro es `admin@metashark.tech` con contraseña `EliteShark2026!`. Utiliza SIEMPRE los IDs deterministas definidos en este manifiesto para evitar registros huérfanos. Si creas contenido, vincula `tenant_id` al ID `00000000-0000-0000-0000-000000000001`. Respeta la columna `password` del SQL manual y la columna `hash` de Payload; son la misma entidad bajo distintos motores."

---
**Certificación de Integridad:**
Infraestructura nivelada exitosamente tras la purga nuclear del 26/03/2026.

---


C:\Users\VAIO\apps\aaa-proyectos-propios\___hotel-beach-portfolio-container\hotel-beach-portfolio>pnpm run db:seed

> @metashark/monorepo@1.0.0 db:seed C:\Users\VAIO\apps\aaa-proyectos-propios\___hotel-beach-portfolio-container\hotel-beach-portfolio
> tsx scripts/supabase/seed-database.ts

[dotenv@17.3.1] injecting env (9) from .env.local -- tip: 🔐 prevent committing .env to code: https://dotenvx.com/precommit

=== GENESIS ENGINE: DETERMINISTIC UUID BOOTSTRAP V16 ===

(node:8100) Warning: Setting the NODE_TLS_REJECT_UNAUTHORIZED environment variable to '0' makes TLS connections and HTTPS requests insecure by disabling certificate verification.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:8100) Warning: SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated as aliases for 'verify-full'.
In the next major version (pg-connection-string v3.0.0 and pg v9.0.0), these modes will adopt standard libpq semantics, which have weaker security guarantees.

To prepare for this change:
- If you want the current behavior, explicitly use 'sslmode=verify-full'
- If you want libpq compatibility now, use 'uselibpqcompat=true&sslmode=require'

See https://www.postgresql.org/docs/current/libpq-ssl.html for libpq SSL mode definitions.
E-mail configured with ethereal.email test account.
Log into mock email provider at https://ethereal.email
Mock email account username: lbu2gty5jcrgjw4r@ethereal.email
Mock email account password: 5htTS91wBKHktPTzZw
[✓] Pulling schema from database...
[BOOTSTRAP] Sincronizando Administrador Maestro...
   ✓ Identidad inyectada (ID: b174d3a8-e1ed-4054-8b63-55cce8749c11)
[BOOTSTRAP] Sincronizando Propiedad Principal...
   ✓ Tenant registrado (ID: 00000000-0000-0000-0000-000000000001)
[BOOTSTRAP] Sincronizando Media Library...
[HEIMDALL][MEDIA] Asset Ingested: genesis-1.png | Alt: Genesis Asset Placeholder
   ✓ Media Placeholder activo (ID: c123d456-e789-4054-8b63-99fce8749c22)
[BOOTSTRAP] Poblando Journal Editorial...
   ✓ Articulo: guia-vida-nocturna-floripa (DB_ID: 3716534a-d524-46c6-b3e4-6ef9a10c376e)
   ✓ Articulo: secretos-de-canasvieiras (DB_ID: 7510282d-b62c-4b8c-9b20-687648969823)
   ✓ Articulo: pride-escape-2026-guia (DB_ID: 3c1d6384-0d49-408d-b488-7a3794895783)
[BOOTSTRAP] Registrando Activos de Ingeniería...
   ✓ Proyecto: oh-hostels-platform (DB_ID: 6783ab66-b801-4c27-a210-b577de104343)
   ✓ Proyecto: meta-shark-ecosystem (DB_ID: f84c925d-0031-48eb-8244-b3f9b786e5f3)

✨ GENESIS COMPLETO: Datos maestros inyectados con IDs soberanos.


C:\Users\VAIO\apps\aaa-proyectos-propios\___hotel-beach-portfolio-container\hotel-beach-portfolio>

---

