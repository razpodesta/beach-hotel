# Documento Conceptual: Orquestador Soberano de Recepción (Landing Page)

## 1. METADATOS DEL APARATO
- **Ruta Espejo:** `.documentation/apps/portfolio-web/src/app/[lang]/page.md`
- **Ruta Origen:** `apps/portfolio-web/src/app/[lang]/page.tsx`
- **Tipo de Aparato:** Orquestador de Página (Server Component) / Data Synthesizer.
- **Silo / Dominio:** Experiencia de Usuario (UX) / Inteligencia de Datos.

## 2. VISIÓN HOLÍSTICA E INTEGRACIÓN AL ECOSISTEMA
Este aparato actúa como el **Director de Escena** de la recepción del hotel. Es un *Server Component* que realiza el "Handshake de Convergencia":
- **Conexión con el Reactor de Datos:** Consume el núcleo de Payload CMS (`@metashark/cms-core`) para extraer la configuración viva del Tenant (punteros de video, audio y visuales de IA).
- **Sincronía MACS:** Inyecta los diccionarios localizados, asegurando que la narrativa sea coherente con el territorio lingüístico.
- **Join Lógico de Activos:** Implementa el patrón "Asset Proxy", donde cruza los archivos binarios alojados en S3 (vía Media Vault) con los metadatos descriptivos del JSON, permitiendo actualizaciones de diseño sin despliegues de código.

## 3. ANATOMÍA FUNCIONAL
1. **Handshake de Perímetro (Tenant Discovery):** Localiza el nodo `MASTER_TENANT_ID` para extraer la identidad visual activa.
2. **Build Isolation Guard:** Detecta entornos de compilación de Vercel (`IS_BUILD_ENV`) para servir *Mocks Génesis*, garantizando que el build nunca falle por latencia de base de datos.
3. **Resolución Dinámica de Hero:** Prioriza los activos configurados en el panel administrativo sobre los fallbacks estáticos, permitiendo cambios de temporada (Hotel vs Festival) en tiempo real.
4. **Síntesis Visual IA (Visual Synth):** Procesa la colección de medios con contexto `ai-synth` y les asigna su "Voz Editorial" mediante un mapeo de llaves técnicas (`filenameKey`), alimentando al orbe WebGL 2.0.
5. **Generador de Metadatos SEO:** Orquesta el título y descripción dinámica para maximizar el PageRank regional.

## 4. APORTE AL ECOSISTEMA SOBERANO
Es el motor de **Conversión y Autoridad**. Al integrar WebGL, IA y una infraestructura Multi-Tenant, posiciona al Beach Hotel como un líder en tecnología aplicada a la hospitalidad. El uso de `force-static` con `revalidate` garantiza un rendimiento de grado A en Core Web Vitals (LCP < 1.2s).

## 5. HORIZONTE DE EVOLUCIÓN (Mejoras Futuras)
1. **A/B Testing en Borde:** Implementar una variante del orquestador que sirva diferentes configuraciones del Hero basadas en *Edge Config* de Vercel para optimizar la conversión de reservas.
2. **Contextual Asset Loading:** Cargar diferentes resoluciones de video basándose en la telemetría de red (`connection-speed`) recibida en los headers de la petición.

---

