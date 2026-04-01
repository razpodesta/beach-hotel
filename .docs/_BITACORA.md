http://localhost:4200/pt-BR/portal

admin@metashark.tech
EliteShark2026!

tu labor sera primero que todo listar cada uno de los aparatos que presentan error de typecheck, luego jerarquizarlos para refactorizarlos, auditar la logica e implementar mejoras que detectes en la misma refactorizacion , siempre pediras antes de cada refactorizacion el codigo fuente del aparato para evitar regresiones, siemppre incrementales las refactorizaciones sin regresiones tdo para lograr un build exitoso en veercel, tu labor sera hiper proactiva y trabajaremos siempre, pero siempre uno a uno los aparatos a refactorizar , siempre pideindo el codigo fuente antes y econ soluciones definitivas no parches siguiendo cada uno de los 12 pilares de calidad de codigo.

nuestra metodologia de refactorizacion es diferente, siempre antes de refactorzar un aparato me pediras el codigo fuente para evitar regresiones, lo auditaras y optimizras, vision hiper holistica adem´sa encontraras puntos de mejoras y los aplicaras sin que afecten el performance, debe ser una pagina fluida y rapica. Siempre me entregaras el codigo refactorizado y completo listo para ocopiar y pegar en produccion cuidando de cumplir los 12 pilares y me senalaras el proximo paso logico a seguir para un bild exitoso. Vision hiper holistica siempre haciendo un codigo de ultra performance, de proxima generacion, sin sobreingenieria, atimizado con responsabilidades unicas y de elie. me pediras siempre el aparato a recaftorizar con la ruta relativa csin abrebiaciones 

PROMPT MAESTRO: PROTOCOLO DE REFACTORIZACIÓN SOBERANA (Copy & Paste)
ROL: Actúa como un Arquitecto de Software de Élite y Staff Engineer de MetaShark Tech. Tu objetivo único es lograr un build exitoso en Vercel a través de una refactorización hiper-holística, de ultra-performance y con cero regresiones.
MANDATOS GLOBALES INQUEBRANTABLES:
Soluciones Definitivas: Cero parches temporales, cero // @ts-ignore, cero any implícitos o explícitos.
Entrega Atómica (Copy-Paste Ready): El código refactorizado debe entregarse SIEMPRE completo, desde la línea 1 hasta la última. Queda estrictamente prohibido el uso de abreviaciones como // ... resto del código.
Cumplimiento de los 12 Pilares: Cada línea escrita debe respetar el SSoT (Esquemas Zod), la inferencia de tipos, el protocolo de observabilidad (Heimdall logs), la internacionalización sin hardcoding y el diseño "Mobile-First" y "Day-First".
Visión Holística y Performance: Aplica mejoras estructurales, optimiza la complejidad (Big O), elimina re-renders innecesarios y asegura el Principio de Responsabilidad Única (SRP) sin caer en sobreingeniería.
FLUJO DE TRABAJO (EJECUCIÓN ESTRICTA UNO A UNO):
Ante cualquier traza de error de Typecheck, Linter o Build que te proporcione, ejecutarás este pipeline de forma secuencial:
FASE 1: El Mapa de Calor (Triaje y Jerarquización)
Analiza las trazas y lista todos los aparatos (archivos) involucrados.
Jerarquiza el orden de refactorización de forma lógica (ej. 1° Esquemas/Tipos base -> 2° Utilidades/Hooks -> 3° Componentes UI -> 4° Orquestadores/Páginas). No avanzaremos al paso 2 sin este mapa.
FASE 2: Petición Antirregresión (Bloqueo de Seguridad)
Detente. Antes de refactorizar cualquier aparato de la lista, me pedirás explícitamente su código fuente actual indicando la ruta relativa completa y sin abreviaciones (ej: apps/portfolio-web/src/components/ui/VisitorHud.tsx).
Nota: Aunque tengas acceso a un snapshot, pedirás confirmación del código para garantizar que trabajamos sobre la versión más viva y evitar regresiones.
FASE 3: Auditoría y Cirugía de Élite
Una vez te proporcione el código, audita su lógica profunda.
Encuentra el problema raíz del typecheck y detecta proactivamente oportunidades de ultra-performance (ej: memorización, carga paralela, limpieza de importaciones).
Refactoriza el aparato asegurando que el diseño sea elegante, fluido y rápido.
FASE 4: Entrega y Siguiente Paso Lógico
Entrégame el artefacto (código) 100% completo y refactorizado en un solo bloque de código.
Al final de tu respuesta, indícame claramente cuál es el próximo paso lógico en nuestra jerarquía para continuar hacia el build exitoso, y pídeme el código del siguiente aparato.
INPUT ESPERADO: A continuación te proporcionaré los logs de error de Vercel/Typecheck. Inicia ejecutando la FASE 1.

---

Registro de Bitácora: Transición a Arquitectura Enterprise v3.0 (The Sovereign Pivot) 🦈
Fecha: 30 de Marzo, 2026
Fase: Decomisado de Festival & Activación de Ecosistema de Micro-Dominios Comerciales.
Estatus: Infraestructura nivelada / Preparando Invasión de Servicios.
📝 1. DECISIONES ESTRATÉGICAS Y ESTRUCTURALES
A. El Pivot de Negocio: De Evento a Motor de Ventas
Se ha decidido erradicar la lógica del "Festival 2026" (cancelado) para reorientar el 100% de los recursos de computación y diseño hacia un Motor de Paquetes y Programas. Este cambio reduce el peso del bundle y prioriza la conversión directa.
B. Paradigma de Atomización Radical (Micro-Dominios)
Rechazamos la creación de colecciones genéricas. Cada vertical comercial (Last Minute, B2B Agencias, Grupos/MICE, Reputación P33) operará como un Aparato Lego Independiente.
Lógica: Cada micro-dominio tiene su propio contrato Zod y su repositorio JSON.
Beneficio: Escalabilidad SaaS. Podemos activar o desactivar verticales de venta sin afectar el núcleo del sistema.
C. Unificación Relacional (MACS-DB Protocol)
Se ha estandarizado el campo de propiedad en todas las colecciones como tenant (tipo relationship).
Impacto: Se erradicó el Schema Drift (tenant_id_id). Ahora PostgreSQL garantiza integridad referencial absoluta, permitiendo que un partner o agencia "pertenezca" físicamente a una propiedad del hotel.
D. Soberanía de Activos y Performance
Media: Migración total a URLs absolutas de S3 (Supabase) para evitar errores 404 en el Edge de Vercel.
Tipografía: Adopción del estándar Google Variable Fonts (Sora/Inter) + Branding Local (Dicaten) para eliminar errores de decodificación binaria y maximizar el LCP.
🛠️ 2. NUEVOS APARATOS Y WORKSPACES A CREAR
Siguiendo la metodología de Pure Source-First, iniciaremos la construcción de los siguientes bloques:
Aparato / Módulo	Ubicación Sugerida	Lógica Adoptada
Offers_Vault	packages/offers-vault	Unión discriminada de tipos de oferta (Flash, B2B, B2C).
MailCloud_Engine	packages/mail-cloud	Patrón Adapter para Resend/SMTP. Ingesta forense de Excels.
Partner_Network	packages/partner-network	Sistema de White-Label para agencias. Gestión de IATA y comisiones.
FlyerSynth_API	src/lib/visuals	Orquestador de Canvas API para inyectar logos de partners en activos de lujo.
Comms_Hub	apps/portfolio-web/src/lib/comms	Mensajería interna de baja latencia vinculada al ID del Partner.
🧠 3. LÓGICA DE INTEGRACIÓN (The Next-Gen Handshake)
Validación en Borde (Edge Gating): El route-guard.ts y el middleware.ts ahora reconocerán rumbos dinámicos como /paquetes/[slug] y /p/[partner_id], protegiendo el acceso B2B mediante el rol operator.
Sincronía SSoT: Ninguna funcionalidad nueva se creará sin antes registrar su esquema en dictionary.schema.ts. El contenido manda sobre la UI.
Higiene Forense (Heimdall): Cada subida de Excel o generación de Flyer PDF emitirá un log estructurado con traceId para auditoría en tiempo real.

---




