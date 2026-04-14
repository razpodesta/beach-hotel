# Documento Conceptual: Reactor Editorial y de Reputación (Journal Engine)

## 1. METADATOS DEL APARATO
- **Ruta Espejo:** `.documentation/apps/portfolio-web/src/lib/blog/actions.md`
- **Ruta Origen:** `apps/portfolio-web/src/lib/blog/actions.ts`
- **Tipo de Aparato:** Motor Lógico de Datos / Reactor de Gamificación.
- **Silo / Dominio:** Editorial (Journal) / Reputación (Protocolo 33).

## 2. VISIÓN HOLÍSTICA E INTEGRACIÓN AL ECOSISTEMA
Este aparato es el orquestador del **Ciclo de Vida del Conocimiento**. Su misión es doble: proveer la narrativa del hotel y cuantificar el valor de la atención del huésped.
- **Sincronía con Payload 3.0:** Realiza el handshake de datos utilizando el patrón *Isolated Synthesis*, permitiendo que el blog funcione incluso si el clúster de datos está en mantenimiento (Mocks fallback).
- **Reactor P33 (RazTokens):** Implementa el disparador `recordReadingXPAction`, que conecta el éxito de lectura con la base de datos de usuarios para otorgar experiencia (XP) y ascender rangos.
- **Trasmuta AST a MDX:** Posee un compilador interno que transforma la estructura compleja de bloques de Lexical (Payload) en Markdown purificado para `next-mdx-remote`.

## 3. ANATOMÍA FUNCIONAL
1. **LexicalCompiler (Pure Logic):** Un transformador de nodos que navega el árbol sintáctico del CMS para generar texto plano estructurado, garantizando que el SEO sea legible por rastreadores.
2. **EditorialShaper (SSoT Normalizer):** Valida la integridad de la respuesta del CMS contra el esquema Zod `postWithSlugSchema`. Si un dato está corrupto, lo descarta antes de que llegue a la UI (Pilar III).
3. **EditorialDataResolver (Resilient Fetcher):** Gestiona la concurrencia y el aislamiento de build. Si detecta el entorno de compilación de Vercel o la ausencia de `DATABASE_URL`, sirve automáticamente los **Mocks Génesis**.
4. **Reputation Injector:** Acción de servidor blindada que gestiona la lógica de "XP por Lectura", emitiendo notificaciones internas al Silo D para confirmar la recompensa al usuario.

## 4. APORTE AL ECOSISTEMA SOBERANO
Este aparato es el motor de **Retención y Autoridad**. El Journal posiciona al hotel como un experto en el destino (Florianópolis), mientras que la inyección de XP incentiva al usuario a permanecer autenticado y explorar el ecosistema, alimentando el *Growth Flywheel* de la marca.

## 5. HORIZONTE DE EVOLUCIÓN (Mejoras Futuras)
1. **AI Content Summarizer:** Integrar una fase de pre-procesamiento que genere resúmenes ejecutivos automáticos para el `VisitorHud`.
2. **Predictive Vibe Matching:** Ajustar el `vibe` (Día/Noche) del artículo en tiempo real basándose en la telemetría lumínica recibida por el HUD del visitante.

---

