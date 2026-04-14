# Documento Conceptual: Orquestador Soberano de Tráfico de Borde (Middleware)

## 1. METADATOS DEL APARATO
- **Ruta Espejo:** `.documentation/apps/portfolio-web/middleware.md`
- **Ruta Origen:** `apps/portfolio-web/middleware.ts`
- **Tipo de Aparato:** Centinela de Borde / Orquestador de Tráfico Perimetral (Edge Gateway).
- **Silo / Dominio:** Infraestructura Core, Redes y Posicionamiento Global (SEO).

## 2. VISIÓN HOLÍSTICA E INTEGRACIÓN AL ECOSISTEMA
El `middleware.ts` actúa como la "Muralla Exterior" del ecosistema MetaShark. Es el primer fragmento de código que se ejecuta cuando una petición HTTP llega a la infraestructura, operando directamente en los nodos perimetrales (Vercel Edge Runtime) antes de alcanzar el servidor de origen (Node.js/Next.js Server).

Sus interconexiones son críticas y de alto nivel:
- **Sinergia con el Códice de Idiomas (`i18n.config.ts`):** Consulta constantemente el contrato inmutable de idiomas para validar si las rutas solicitadas pertenecen a un territorio lingüístico soportado, actuando como un puente entre la URL física y el diccionario lógico. Su directriz de hierro es el **Fallback a `pt-BR`** (Portugués de Brasil) ante cualquier anomalía o ausencia de contexto.
- **Delegación de Seguridad (`route-guard.ts`):** Funciona bajo el principio de separación de responsabilidades (SRP). El middleware inspecciona el tráfico bruto, pero delega el escrutinio criptográfico de la sesión y el control de acceso basado en roles (RBAC) al `route-guard`.
- **Blindaje de Caché Perimetral (Vercel CDN):** Manipula activamente los encabezados HTTP de las respuestas (`Cache-Control: no-store, max-age=0`) en redirecciones dinámicas. Esto evita el *Edge Cache Poisoning*, garantizando que una redirección basada en la identidad VIP no quede guardada en la CDN y se sirva por error a un huésped anónimo.

## 3. ANATOMÍA FUNCIONAL
1. **Filtro de Exclusión de Alta Velocidad (Bypass Infraestructural):** Discrimina inmediatamente las peticiones dirigidas a estáticos, imágenes, fuentes, rutas del CMS (`/_payload`) o APIs internas, permitiendo que pasen sin consumir ciclos de cómputo en el Edge (Zero-Latency TTFB).
2. **Erradicación de la Ruta Huérfana (SEO Root Fix):** Intercepta de forma inteligente el tráfico hacia el dominio raíz (`/`) y dispara una redirección temporal segura (HTTP 307) hacia el perímetro de idioma correspondiente (`/[lang]`), con preferencia absoluta por `/pt-BR`. Elimina el error 404 nativo de Vercel.
3. **El Motor Políglota (Dynamic Locale Negotiation):** Analiza el contexto del visitante combinando el historial de preferencias (Cookie `NEXT_LOCALE`) con la firma del navegador (Header `accept-language`). 
4. **Auto-Reparación de Rumbos (Self-Healing Routing):** Si un visitante intenta acceder a un idioma inexistente (ej. `/fr/paquetes`), el centinela detecta la anomalía, recalcula el idioma óptimo para ese usuario, y muta la ruta "al vuelo" hacia un perímetro válido.
5. **Inyección de Trazabilidad Forense (Heimdall Pulse):** Sella la respuesta HTTP con metadatos operativos (`X-Heimdall-Trace`, `X-Edge-Latency`). Esta telemetría permite monitorear la salud de la red desde herramientas externas sin alterar el payload del cliente.

## 4. APORTE AL ECOSISTEMA SOBERANO
Este aparato es el pilar maestro de la **Adquisición y la Seguridad Frontal**. 
A nivel comercial (Revenue), garantiza que la "Succión Digital" sea perfecta: un huésped nunca aterrizará en un callejón sin salida (404) ni en un idioma incorrecto, reduciendo el *Bounce Rate* y elevando el SEO (E-E-A-T). A nivel de infraestructura, ahorra costos de computación al abortar anomalías antes de que despierten los procesos pesados del clúster principal.

## 5. HORIZONTE DE EVOLUCIÓN (Mejoras Futuras)
1. **Inyección de Geolocalización Activa en Borde (Edge Geo-Routing):**
   - *Justificación:* Vercel Edge Runtime ya expone objetos como `req.geo` y `req.ip`. Interceptar esto en el middleware y enviarlo como un *Header* hacia el cliente eliminaría peticiones HTTP externas, logrando una hidratación del Visitor HUD con latencia cero.
2. **Defensa Táctica Anti-Scraping (L0 Rate Limiting):**
   - *Justificación:* Integrar una solución de memoria ultrarrápida (como `@vercel/kv`) para detectar y sofocar ráfagas de peticiones maliciosas (Scraping de tarifas netas del Silo A) antes de que lleguen a PostgreSQL.