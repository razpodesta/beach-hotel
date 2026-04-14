# Documento Conceptual: Bóveda de Estado Global (The DNA Vault)

## 1. METADATOS DEL APARATO
- **Ruta Espejo:** `.documentation/apps/portfolio-web/src/lib/store/ui.store.md`
- **Ruta Origen:** `apps/portfolio-web/src/lib/store/ui.store.ts`
- **Tipo de Aparato:** Bóveda de Estado Persistente / Reactor de Reputación.
- **Silo / Dominio:** Identidad y Acceso / Lógica de Negocio (Protocolo 33).

## 2. VISIÓN HOLÍSTICA E INTEGRACIÓN AL ECOSISTEMA
El `ui.store.ts` es el único punto de verdad (SSoT) para el estado reactivo del cliente. Mientras el CMS gestiona la persistencia a largo plazo, esta bóveda gestiona la **Experiencia en Tiempo Real**. 
- **Sincronía de Identidad:** Recibe los datos del "Passport" tras el handshake de Supabase y los mantiene accesibles para componentes como el `VisitorHud` y el `Header`.
- **Integración P33:** Consume el `@metashark/reputation-engine` para calcular niveles de ascensión al vuelo, permitiendo que la UI reaccione instantáneamente a la ganancia de XP (RazTokens).
- **Resiliencia SSR:** Implementa un adaptador de almacenamiento híbrido que previene errores de hidratación en Next.js 15, asegurando que el servidor y el cliente compartan una estructura inicial idéntica.

## 3. ANATOMÍA FUNCIONAL
1. **Orquestador de Visibilidad:** Controla de forma atómica la apertura de modales (Auth, Newsletter) y menús, evitando el "Prop Drilling" y manteniendo la limpieza del árbol de React.
2. **Passport Persistente:** Almacena la `AuthorizedSession`. Gracias al middleware `persist`, las credenciales y el rol del usuario sobreviven a recargas de página, eliminando peticiones innecesarias al servidor.
3. **Reactor de Reputación Reactivo:** La acción `updateXP` no solo muta un número; dispara una recalibración completa de nivel y emite señales cromáticas a la consola (Heimdall logs) cuando ocurre una ascensión.
4. **Guardián de Hidratación:** Gestiona el flag `hasHydrated`, permitiendo que los componentes cliente esperen a que el estado local coincida con el disco antes de renderizarse, cumpliendo con el **Pilar VIII (Resiliencia)**.

## 4. APORTE AL ECOSISTEMA SOBERANO
Este aparato es el corazón del **Engagement y Retención**. Al persistir la visibilidad del `VisitorHud`, respetamos la preferencia de inspección técnica del usuario. Al unificar la gestión de sesión, permitimos que el `route-guard.ts` y la UI hablen el mismo idioma de autoridad (RBAC).

## 5. HORIZONTE DE EVOLUCIÓN (Mejoras Futuras)
1. **MACS Sync (Dynamic Labels):** Permitir que el Store almacene fragmentos de diccionarios frecuentemente usados para reducir el paso de Props en componentes profundamente anidados.
2. **Action Queue (Offline Sync):** Implementar una cola de acciones para que las ganancias de XP ocurridas durante micro-cortes de red se sincronicen con el CMS una vez que el "Pulse" de red se restablezca.

---

