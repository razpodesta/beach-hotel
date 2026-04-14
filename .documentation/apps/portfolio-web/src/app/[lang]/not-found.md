# Documento Conceptual: Paracaídas de Error Localizado (Localized Not Found)

## 1. METADATOS DEL APARATO
- **Ruta Espejo:** `.documentation/apps/portfolio-web/src/app/[lang]/not-found.md`
- **Ruta Origen:** `apps/portfolio-web/src/app/[lang]/not-found.tsx`
- **Tipo de Aparato:** Interceptor de Error de Segmento / UI Paracaídas.
- **Silo / Dominio:** Experiencia de Usuario (UX) / Resiliencia Narrativa.

## 2. VISIÓN HOLÍSTICA E INTEGRACIÓN AL ECOSISTEMA
Este aparato actúa cuando un usuario se encuentra dentro de un perímetro de idioma validado (ej. `/pt-BR/...`) pero solicita un recurso inexistente. 
- **Herencia de Layout:** A diferencia del error global, este componente se renderiza *dentro* del `app/[lang]/layout.tsx`, manteniendo la persistencia del Header, Footer y Visitor HUD.
- **Sincronía MACS:** Consume el diccionario específico del idioma actual, garantizando que el mensaje de error sea comprensible y mantenga el tono de voz boutique.
- **Preservación de Flujo:** Utiliza el `detectedLocale` para asegurar que el botón de "Regresar" no saque al usuario de su contexto lingüístico.

## 3. ANATOMÍA FUNCIONAL
1. **Detección de Contexto mediante Path-Parsing:** Analiza el rumbo de la petición a través de los headers de Next.js para determinar en qué territorio de idioma ocurrió la anomalía.
2. **Visualización de Alta Fidelidad (Oxygen Engine):** Integra `BlurText` y gradientes dinámicos en espacio de color OKLCH para que el fallo no se perciba como una ruptura, sino como una transición elegante.
3. **Señalética Técnica (Heimdall Injected):** Muestra el código de error `SYSTEM_ID_404` y emite una traza `warn` en el servidor para auditoría forense de enlaces rotos.
4. **Artefactos Inmersivos:** Proyecta un elemento decorativo (`Compass`) con rotación física fija para simbolizar la pérdida de rumbo y la necesidad de recalibración.

## 4. APORTE AL ECOSISTEMA SOBERANO
Este aparato protege el **Engagement y el SEO**. Al ofrecer una salida clara y estética dentro del mismo idioma, reduce el "Pogo-sticking" (usuarios que vuelven a Google tras un error) y mantiene la **Autoridad de Dominio (E-E-A-T)** al demostrar que el sistema es resiliente y está bajo monitoreo constante.

## 5. HORIZONTE DE EVOLUCIÓN (Mejoras Futuras)
1. **Sugerencias Dinámicas (Smart Linker):** Consultar la colección de `BlogPosts` o `Suites` para ofrecer contenido relacionado con las palabras clave encontradas en la URL fallida.
2. **Auto-Reporte de Brecha:** Disparar una notificación al `CommsHub` (Silo D) si una ruta específica genera múltiples 404 en un periodo corto, alertando sobre un posible error de configuración de marketing.

---

