# Documento Conceptual: Orquestador de Revenue (Silo A Manager)

## 1. METADATOS DEL APARATO
- **Ruta Espejo:** `.documentation/apps/portfolio-web/src/components/sections/portal/OffersDashboard.md`
- **Ruta Origen:** `apps/portfolio-web/src/components/sections/portal/OffersDashboard.tsx`
- **Tipo de Aparato:** Panel de Inteligencia Comercial / Monitor de Yield.
- **Silo / Domain:** Silo A (Revenue & Distribución).

## 2. VISIÓN HOLÍSTICA E INTEGRACIÓN AL ECOSISTEMA
Este aparato es el **Motor de Rentabilidad** del portal administrativo. Su función es transformar el inventario crudo del CMS en decisiones tácticas de venta. 
- **Convergencia de Inventario:** Cruza las colecciones `offers` y `flash-sales` con el motor matemático `revenue.engine.ts`.
- **Telemetría de Riesgo:** Identifica "Presión de Inventario" (Stock Crítico) y lo proyecta visualmente para que el staff actúe sobre las tarifas.
- **Handshake de Acceso:** Utiliza el `tenantId` de la sesión para asegurar que un operador solo visualice y mutte ofertas de su propio perímetro (Multi-Tenant Shield).

## 3. ANATOMÍA FUNCIONAL
1. **Sovereign BI (Business Intelligence):** Calcula en un solo ciclo $O(n)$ el valor total de la exposición en el mercado (`onAirValue`) y el conteo de nodos críticos.
2. **Viewport de Activos:** Renderiza tarjetas de alta fidelidad (`FlashAssetCard`) que reaccionan a la atmósfera Día/Noche del contenido.
3. **Control de Pipeline:** Permite conmutar entre ofertas públicas (B2C) y programas mayoristas (B2B), ajustando los validadores de contrato dinámicamente.
4. **Resiliencia de Red:** Implementa un protocolo de reintento manual ante fallos de sincronización con el clúster de datos, reportando latencias nanométricas via Heimdall.

## 4. APORTE AL ECOSISTEMA SOBERANO
Es vital para la **Maximización de Ingresos**. Al detectar automáticamente el inventario en riesgo, el sistema permite disparar campañas en el Silo C para evacuar stock sobrante, manteniendo el "Growth Flywheel" del hotel en movimiento perpetuo.

## 5. HORIZONTE DE EVOLUCIÓN (Mejoras Futuras)
1. **Dynamic Yield Adjuster:** Integrar un slider que permita ajustar descuentos masivamente y previsualizar el impacto en el `Estimated Yield Exposure` antes de persistir en DB.
2. **Forecast Integration:** Conectar con una API de demanda externa para sugerir la creación de Ofertas Flash basadas en predicciones meteorológicas o eventos locales.

---

