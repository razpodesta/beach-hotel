# Documentación Conceptual: Orquestador Soberano de Tráfico de Borde (Middleware)

## 1. METADATOS DEL APARATO
- **Ruta Espejo:** `.documentation/apps/portfolio-web/middleware.md`
- **Ruta Origen:** `apps/portfolio-web/middleware.ts`
- **Tipo de Aparato:** Centinela de Borde / Orquestador de Tráfico Perimetral (Edge Gateway).
- **Silo / Dominio:** Infraestructura Core, Redes y Posicionamiento Global (SEO).

## 2. VISIÓN HOLÍSTICA E INTEGRACIÓN AL ECOSISTEMA
El `middleware.ts` actúa como la "Muralla Exterior" del ecosistema MetaShark. Es el primer fragmento de código que se ejecuta cuando una petición HTTP llega a la infraestructura, operando directamente en los nodos perimetrales (Vercel Edge Runtime) antes de alcanzar el servidor de origen (Node.js/Payload CMS).

Sus interconexiones son críticas y de alto nivel:
- **Sinergia con el Códice de Idiomas (`i18n.config.ts`):** Consulta constantemente el contrato inmutable de idiomas para validar si las rutas solicitadas pertenecen a un territorio lingüístico soportado, actuando como un puente entre la URL física y el diccionario lógico.
- **Delegación de Seguridad (`route-guard.ts`):** Funciona bajo el principio de separación de responsabilidades (SRP). El middleware inspecciona el tráfico bruto, pero delega el escrutinio criptográfico (JWT, cookies de Payload/Supabase) y el control de acceso basado en roles (RBAC) al `route-guard`, quien sintetiza el "Pasaporte Soberano".
- **Blindaje de Caché Perimetral (Vercel CDN):** Manipula activamente los encabezados HTTP de las respuestas (`Cache-Control: s-maxage=0`) en redirecciones dinámicas para evitar el letal *Edge Cache Poisoning*, garantizando que una redirección basada en la identidad de un usuario VIP no quede guardada en la CDN y se sirva por error a un huésped anónimo.

## 3. ANATOMÍA FUNCIONAL
1. **Filtro de Exclusión de Alta Velocidad (Bypass Infraestructural):** El sistema discrimina inmediatamente las peticiones dirigidas a estáticos, imágenes, fuentes, rutas del CMS (`/_payload`) o APIs internas, permitiendo que pasen sin consumir ciclos de cómputo en el Edge, optimizando los tiempos de TTFB (Time to First Byte).
2. **Erradicación de la Ruta Huérfana (SEO Root Fix):** Intercepta de forma inteligente el tráfico hacia el dominio raíz (`/`) y dispara una redirección temporal segura (HTTP 307) hacia el perímetro de idioma correspondiente (`/[lang]`). Esto elimina la necesidad de tener un "Root Layout" en blanco en Next.js, consolidando el PageRank de SEO y evitando errores 404.
3. **El Motor Políglota (Dynamic Locale Negotiation):** Analiza el contexto del visitante combinando el historial de preferencias (Cookie `NEXT_LOCALE`) con la firma del navegador (Header `accept-language`). Esto asegura que el idioma servido coincida con el contexto nativo del usuario antes de que el DOM comience a hidratarse.
4. **Auto-Reparación de Rumbos (Self-Healing Routing):** Si un visitante intenta acceder a un idioma inexistente (ej. `/fr/paquetes`), el centinela detecta la anomalía, recalcula el idioma óptimo para ese usuario, y muta la ruta "al vuelo" hacia un perímetro válido (ej. `/en-US/paquetes`), sin mostrar pantallas de error.
5. **Inyección de Trazabilidad Forense (Heimdall Pulse):** Sella la respuesta HTTP con metadatos operativos (`X-Heimdall-Trace`, `X-Edge-Latency`, `X-Enterprise-Orchestrator`). Esta telemetría permite a los ingenieros monitorear la salud de la red y tiempos de resolución desde herramientas externas sin alterar el payload del cliente.
6. **Protocolo de Degradación Elegante (Fail-Safe):** Envuelta en un bloque `try/catch` global, la arquitectura garantiza que si el motor de Vercel falla o ocurre un timeout en la resolución lógica, la aplicación no colapsa en un Error 500. El tráfico continúa con un flag de estado degradado (`X-Edge-Status: Degraded`), priorizando siempre mantener el portal del hotel en línea.

## 4. APORTE AL ECOSISTEMA SOBERANO
Este aparato es el pilar maestro de la **Adquisición y la Seguridad Frontal**. 
A nivel comercial (Revenue), garantiza que la "Succión Digital" sea perfecta: un huésped nunca aterrizará en un callejón sin salida ni en un idioma incorrecto, lo cual reduce drásticamente la tasa de rebote (Bounce Rate) y eleva la Autoridad de Dominio (E-E-A-T). A nivel de infraestructura, ahorra costos de computación y ancho de banda al abortar y redirigir anomalías antes de que despierten los procesos "pesados" del clúster principal de Payload CMS.

## 5. HORIZONTE DE EVOLUCIÓN (Mejoras Futuras)
1. **Inyección de Geolocalización Activa en Borde (Edge Geo-Routing):**
   - *Justificación:* Actualmente, la telemetría del `VisitorHud` consulta una API externa (`ip-api.com`) desde el cliente para conocer el país del huésped. Vercel Edge Runtime ya expone objetos como `req.geo` y `req.ip`. Interceptar esto en el middleware y enviarlo como un *Header* hacia el cliente eliminaría una petición HTTP de red, reduciendo la latencia de hidratación del HUD a cero absoluto, logrando una "Telemetría de Precisión Geométrica".
2. **Defensa Táctica Anti-Scraping (L0 Rate Limiting):**
   - *Justificación:* Las agencias competidoras y OTAs (Online Travel Agencies) utilizan bots para raspar (scrape) tarifas netas y disponibilidad del `Silo A` (OffersDashboard). Integrar una solución de memoria ultrarrápida (como `@vercel/kv` o Redis) en el middleware permitiría detectar y sofocar ráfagas de peticiones maliciosas (DDoS o Scraping) antes de que lleguen a PostgreSQL, protegiendo tanto la estrategia de Yield Management del hotel como la base de datos transaccional.