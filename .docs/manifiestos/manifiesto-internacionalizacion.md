# Manifiesto de Internacionalización: "Sovereign Globalization Hub"
**Versión:** 1.0 (Infraestructura de Escala Masiva)
**Estado:** ACTIVO / OBLIGATORIO
**Autor:** Raz Podestá - MetaShark Tech

## 1. Filosofía: "Local en el Corazón, Global en la Ingeniería"
La internacionalización en el ecosistema Beach Hotel no es una traducción de textos; es una orquestación de identidades. El portal debe sentirse nativo para el huésped (UX), pero permanecer estandarizado para la infraestructura (DX).

### Los 3 Postulados de la Red Global
1. **Soberanía de Identidad:** Cada idioma se presenta con su Glosa Nativa para generar empatía inmediata.
2. **Estándar Pivote:** El "International English" es el lenguaje de auditoría interna (`intName`).
3. **Escalabilidad Latente:** La arquitectura debe soportar el mapeo de 127+ regiones aunque solo 3 estén activas hoy.

## 2. Componentes de la Arquitectura (The I18N Stack)

### I. El Códice (Infraestructura)
Ubicado en `src/lib/config/languages-codex.ts`. Es la única fuente de verdad (SSoT) para el inventario de lenguajes.
- **Campos Obligatorios:** `code`, `nativeName`, `intName`, `regionName`, `intRegionName`, `isImplemented`.
- **Regla:** Queda prohibido añadir un idioma al orquestador sin haberlo registrado previamente en el Códice.

### II. El Contrato (Schema)
Ubicado en `src/lib/schemas/language_switcher.schema.ts`.
- Valida que los archivos JSON contengan no solo los nombres de los idiomas, sino también los tokens de **Atmósfera** (Día/Noche) y etiquetas de búsqueda.
- Implementa `z.record` para validar dinámicamente el mapa de regiones.

### III. El Hub de Globalización (UI/UX)
El `LanguageSwitcher.tsx` evoluciona de un dropdown a un **Portal Takeover**.
- **Jerarquía Visual:** 1. Idiomas del Santuario (Activos) | 2. Red Global (Futuros).
- **Filtrado Forense:** Búsqueda en tiempo real que cruza códigos ISO, nombres nativos y nombres internacionales.

## 3. Leyes de Implementación (12 Pilares Sync)

### 1. Erradicación de Hardcoding (Pilar VI)
Ningún nombre de país o idioma debe existir directamente en el JSX. El componente `LanguageCard` debe consumir exclusivamente el Códice y el Diccionario.

### 2. Resolución en el Edge (Middleware)
La redirección de idioma ocurre en el perímetro de Vercel. 
- Formato Canónico: `/[locale]/[path]`
- Persistencia: Uso de la cookie `NEXT_LOCALE` con expiración de 1 año y atributo `SameSite=Lax`.

### 3. Sincronía Atmosférica (Día/Noche)
El selector de idiomas y el `ThemeToggle` comparten el mismo fragmento de diccionario (`language_switcher.json`). Esto garantiza que los controles del Header tengan coherencia terminológica total.

## 4. Guía de Operación: Añadir un Nuevo Idioma

Para activar un nuevo nodo en la red global (ej: Francés de Francia):
1. **Localizar en el Códice:** Cambiar `isImplemented: false` a `true` en `languages-codex.ts`.
2. **Crear Contrato Físico:** Añadir la carpeta `src/messages/fr-FR/` con sus respectivos JSON.
3. **Nivelar Esquema:** Registrar el nuevo código en `language_switcher.schema.ts`.
4. **Ejecutar Prebuild:** `pnpm run prebuild:web` para generar el artefacto compilado.

## 5. Métrica de Élite: Performance de Carga
El ensamblaje de diccionarios ocurre en **Tiempo de Pre-construcción**. El cliente nunca descarga el Códice completo de 127 idiomas a menos que abra el Portal de Globalización (Dynamic Import), manteniendo el bundle inicial por debajo de los límites de Vercel.

---
**Certificación de Calidad:**
Este manifiesto garantiza que el Beach Hotel Canasvieiras pueda recibir al mundo sin generar una sola línea de deuda técnica.

---

