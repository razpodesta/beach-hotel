# Manifiesto: Bóveda de Ofertas Polimórficas (Offers Vault)
**Versión:** 1.0 (Arquitectura de Conversión Dinámica)
**Estatus:** OBLIGATORIO / SSoT
**Workspace:** `@metashark/offers-vault`

## 1. Misión
Centralizar la inteligencia comercial del hotel mediante un motor de productos desacoplado que permita la creación de experiencias de venta personalizadas para cada segmento del mercado (B2C, B2B, Grupos).

## 2. Arquitectura de Datos (Polimorfismo)
Cada oferta es una entidad soberana con un `slug` único y está vinculada a un `tenant`. El sistema debe soportar los siguientes tipos mediante una unión discriminada en Zod:

- **B2C Retail:** Ofertas públicas para visitantes. Enfoque en LCP y SEO.
- **B2B Wholesale:** Tarifas netas exclusivas para Agencias (Rol: `operator`).
- **Last Minute:** Gatillos dinámicos vinculados al inventario real.
- **Group Incentives:** Paquetes cerrados para eventos corporativos o sociales.

## 3. Atributos Técnicos Obligatorios
- **Identidad:** `title`, `slug`, `type`, `status`.
- **Economía:** `basePrice`, `currency`, `discount_logic`.
- **Logística:** `nightsCount`, `validFrom`, `validUntil`.
- **Inclusiones:** Array de strings (Luxe Inclusions).
- **Media S3:** Relación directa con la colección `media` para Hero Images.

## 4. Gobernanza Administrativa
- Acceso exclusivo a roles `admin` y `developer`.
- Indexador de alto rendimiento con búsqueda semántica por etiquetas y temporadas.