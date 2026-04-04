# Manifiesto: Arquitectura de Root Layout e I18n
**Versión:** 1.0 (Resolución Final)
**Estado:** OBLIGATORIO

## 1. Regla de Oro
Toda aplicación en el App Router DEBE tener un `app/layout.tsx` en la raíz absoluta. Este archivo solo debe contener `<html>` y `<body>`.

## 2. Estructura de Internacionalización
Para rutas localizadas `/[lang]/...`, la estructura es:
- `app/layout.tsx`: Root Layout (Base mínima).
- `app/[lang]/layout.tsx`: Layout localizado (Providers, Header, Footer).
- `app/[lang]/[...page]/page.tsx`: Contenido.
- `app/not-found.tsx`: Paracaídas global (fuera de [lang]).

## 3. Resolución de Errores de Build
- Si el build falla por `<Html>` fuera de `_document`, es porque falta `app/layout.tsx` o este intenta importar componentes de `pages/`.
- El Root Layout debe ser lo más estático posible. No debe ejecutar lógica de datos pesada.