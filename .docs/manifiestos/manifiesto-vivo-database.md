Constitución de Datos: Manifiesto de Colecciones Soberanas (MACS-DB) v1.0 🦈
Este documento es el Códice Vivo de la estructura de datos del ecosistema Beach Hotel. Actúa como un Prompt de Continuidad de Élite que define la arquitectura relacional, el propósito de cada entidad y el estado actual de la sincronización entre el Código (Payload 3.0) y la Persistencia (Supabase/PostgreSQL).
📜 1. FILOSOFÍA RELACIONAL: "THE SOVEREIGN TENANT"
En MetaShark Tech, los datos no flotan; pertenecen. El pilar central es el Aislamiento Multi-Tenant. Absolutamente toda entidad comercial debe estar anclada a un Tenant ID para garantizar la soberanía de datos y permitir la escalabilidad SaaS futura.
Identificadores Maestros (Génesis):
MASTER_TENANT_ID: 00000000-0000-0000-0000-000000000001 (El ancla del hotel).
MASTER_ADMIN_ID: b174d3a8-e1ed-4054-8b63-55cce8749c11 (La identidad raíz).
🏛️ 2. EL CÓDICE DE COLECCIONES (Data Architecture)
A. Identidad: users
Propósito: Clúster de identidad y reputación.
RBAC: 5 niveles (Developer S0 -> Guest S4).
Lógica P33: Almacena experiencePoints y level.
Handshake: Sincronizado con Supabase Auth vía email.
Contrato de Propiedad: Debe usar tenant como relationship (Próxima Mejora).
B. Perímetro: tenants
Propósito: Definición de fronteras legales y digitales.
Atributos: Nombre comercial, slug SEO y dominio DNS.
Estatus: SSoT para la validación de acceso en el Edge Middleware.
C. Bóveda: media
Propósito: Gestión de activos binarios de alta fidelidad.
Infraestructura: Sincronía Cloud S3 (Supabase Storage).
UX Sync: Implementa focalPoint y imageSizes optimizados para LCP.
Punto de Falla: Actualmente sufre de Schema Drift (tenantId vs tenant_id_id).
D. Narrativa: blog-posts
Propósito: Concierge Journal (SEO E-E-A-T).
Inteligencia: Cálculo automático de readingTime y detección de vibe (Día/Noche).
Relación: Vinculado a users (Autor) y media (OG Image).
E. Activos: projects
Propósito: Catálogo de ingeniería y activos digitales.
Comercial: Define el reputationWeight (XP otorgada al interactuar).
Estética: Controla el primary_color y layout_style de las micro-vistas.

---

MANIFIESTO DE COLECCIONES SOBERANAS (MACS-DB) - ADENDA FINAL
Estado del Ecosistema: Sincronización de Producción.
1. El Estándar de Propiedad (The Tenant Pivot)
Decisión Arquitectónica: Se erradica el campo de texto tenantId.
Realidad Final: Todas las colecciones (media, users, blog-posts, projects) utilizan ahora un campo de tipo relationship llamado tenant.
Impacto en DB: Genera automáticamente una columna tenant_id vinculada a la tabla tenants. Esto garantiza que no existan datos huérfanos y permite el aislamiento físico de registros en Supabase.
2. Evolución de la Bóveda Multimedia (Media Schema)
Ajuste de Fidelidad: Se ha renombrado el tamaño de imagen hero a hero-cinematic (2560x1080) para el HeroCarousel.
Protocolo de Migración: Ante la pregunta del CLI:
¿Is sizes_hero_cinematic_url renamed from sizes_hero_url? -> SÍ (Rename).
Justificación: Estamos migrando metadatos antiguos a la nueva nomenclatura de ultra-fidelidad. No queremos crear columnas nuevas, sino evolucionar las existentes.
3. Integridad de Identidad (Users Table)
Relación Fuerte: La tabla users ahora tiene una clave foránea real hacia tenants.
Seeding Protocol: El usuario admin@metashark.tech debe ser el propietario del Tenant 00000000-0000-0000-0000-000000000001 mediante esta relación de objeto, no mediante un string plano.
🤖 PROMPT DE CONTINUIDAD ACTUALIZADO (Para la IA)
"Actúa como Staff Engineer de MetaShark. La base de datos Supabase está en PostgreSQL 17.6. El esquema actual tiene 16 tablas. El objetivo es forzar la unificación del campo tenant (relacional) y aceptar los renombramientos de la colección media (hero -> hero-cinematic). No permitas la creación de columnas duplicadas; prefiere siempre el Rename sobre el Create para mantener la historia de los assets. Una vez que el Seeder termine, la Realidad Física (/public) y la Realidad Digital (DB) serán un único bloque inmutable."

---