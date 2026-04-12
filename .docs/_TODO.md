🗺️ PLAN MAESTRO: MIGRACIÓN A BÓVEDA S3 (The Tenant Awakening)
Para lograr que el Portafolio funcione 100% como un motor SaaS dinámico consumiendo desde el CMS, ejecutaremos esta hoja de ruta estricta.
FASE 1: Validación del Flujo de Identidad y Acceso (El Handshake)
Antes de subir recursos, necesitamos entrar al Portal como Administradores Soberanos.
Test de Autenticación: Utilizaremos el Modal de Login (AuthModal.tsx) para ingresar con las credenciales maestras inyectadas por nuestro Seeder (admin@metashark.tech).
Validación de RBAC: El route-guard.ts debe reconocernos como developer o admin y permitirnos el acceso a tudominio.com/es-ES/portal.
Tenant Bind: Confirmar que nuestra sesión está atada al MASTER_TENANT_ID.
FASE 2: Test de Ingesta en la Bóveda (Silo C -> S3)
Aparato: AdminMediaPanel.tsx.
Operación: Usaremos este panel en el portal para subir las imágenes clave (Hero, About, Suites).
Validación de Red: Confirmar que el CMS procesa la imagen, la sube al bucket sanctuary-vault de Supabase, y nos devuelve una URL absoluta (ej: https://[id].supabase.co/storage/v1/object/public/sanctuary-vault/hero-hotel.jpg).
FASE 3: Erradicación de Hardcoding en Componentes (La Cirugía)
Aquí es donde entraremos al código. He detectado los componentes que tienen rutas estáticas "quemadas" y debemos refactorizarlos para que consuman desde los Diccionarios (MACS) o desde Fetchs dinámicos.
AboutSection.tsx: Actualmente tiene <Image src="/images/hotel/about-building-front.jpg" />.
Cirugía: Modificar el about_section.schema.ts para aceptar una URL de imagen, actualizar los JSONs y refactorizar el componente.
SuiteGallery.tsx y SuiteCard.tsx: Actualmente consumen datos de suite_gallery.schema.ts que apuntan a rutas locales.
AiContentSection.tsx: Actualmente consume un array estático en src/data/ai-gallery.ts.
Cirugía: Moveremos este registro estático a los diccionarios JSON para que puedan apuntar a Supabase.
Avatar.tsx y TestimonialCard.tsx: Rutas de avatares quemadas.
FASE 4: El Normalizador de Activos S3 (The Asset Bridge)
Crearemos un Helper global (ya existe una versión primitiva en HeroCarousel.tsx llamada getAssetUrl) que intercepte cualquier ruta de imagen.
Si la ruta es de Supabase S3, la deja pasar.
Si no tiene dominio, le inyecta dinámicamente el endpoint del Bucket de Supabase.