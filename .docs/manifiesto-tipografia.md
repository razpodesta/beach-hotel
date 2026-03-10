# Manifiesto de Tipografía: La Voz del Portafolio
**Versión: 1.0**
**Fecha: 2025-11-07**

## 1. Filosofía

La tipografía es un pilar fundamental de la identidad de este portafolio. No es solo texto; es la voz visual que comunica modernidad, precisión técnica y creatividad. Nuestra filosofía se basa en dos principios:

1.  **Dualidad y Contraste:** Utilizamos un sistema de dos familias de fuentes. Una audaz y con carácter para el impacto, y otra limpia y funcional para la claridad. Este contraste guía la atención del usuario y crea una jerarquía visual natural.
2.  **Rendimiento Inquebrantable:** Todas las fuentes se alojan localmente y se cargan mediante `next/font` en el formato web optimizado `woff2`. Se cargan únicamente los pesos estrictamente necesarios para minimizar el tiempo de carga y garantizar una puntuación perfecta en los Core Web Vitals.

---

## 2. Las Fuentes Oficiales

### 2.1. Voz de Impacto: Clash Display
*   **Familia:** `font-display`
*   **Rol:** Títulos principales, encabezados de sección, y cualquier texto que necesite capturar la atención de inmediato. Su uso debe ser medido y deliberado para mantener su fuerza.
*   **Pesos Cargados:** `Regular (400)`, `Bold (700)`.

### 2.2. Voz de Claridad: Satoshi
*   **Familia:** `font-sans`
*   **Rol:** Cuerpo de texto, párrafos, descripciones de proyectos, etiquetas, botones y todos los elementos de la interfaz de usuario. Su diseño neutro y legible garantiza una experiencia de usuario cómoda.
*   **Pesos Cargados:** Fuente variable (todos los pesos disponibles con una sola carga de archivo).

---

## 3. Jerarquía y Sistema de Uso

La siguiente tabla define el uso canónico de las fuentes y pesos en todo el sitio. La adherencia a esta guía es obligatoria para mantener la coherencia visual.

| Nivel / Elemento           | Fuente         | Peso (Weight) | Clase de Tailwind          | Caso de Uso Específico                               |
| :------------------------- | :------------- | :------------ | :------------------------- | :--------------------------------------------------- |
| **Título Principal (Hero)**| Clash Display  | Bold (700)    | `font-display font-bold`   | El título principal en el `HeroCarousel` (ej. "RAZ-LINEUP"). |
| **Título de Sección (H2)** | Clash Display  | Bold (700)    | `font-display font-bold`   | "Proyectos Destacados", "Entre em Contato".          |
| **Título de Tarjeta (H3)** | Clash Display  | Regular (400) | `font-display font-normal` | El título de cada `ProjectCard`.                     |
| **UI Decorativa (HUD)**    | Clash Display  | Regular (400) | `font-display font-normal` | Coordenadas y datos en el `HeroCarousel`.            |
| **Párrafo / Cuerpo**       | Satoshi        | Regular (400) | `font-sans font-normal`  | Descripciones de proyectos, texto del formulario.  |
| **Enlaces / Botones**      | Satoshi        | Medium (500)  | `font-sans font-medium`  | Elementos de navegación, botones de acción.        |
| **Etiquetas (Tags)**       | Satoshi        | Medium (500)  | `font-sans font-medium`  | Las etiquetas de tecnología en cada `ProjectCard`.     |
| **Texto Enfatizado**       | Satoshi        | Bold (700)    | `font-sans font-bold`    | Para resaltar palabras clave dentro de un párrafo.   |

---

## 4. Reglas Inquebrantables

1.  **No usar `Clash Display` para párrafos largos.** Su legibilidad disminuye en tamaños pequeños y bloques de texto extensos.
2.  **No cargar pesos adicionales** sin justificación de diseño y sin actualizar este manifiesto. Cada `font-weight` es un costo de rendimiento.
3.  **No usar más de dos pesos** de `Clash Display` en una misma vista de pantalla para evitar la sobrecarga visual.```

---

### PASO 3: Archivo `layout.tsx` Completo, Refactorizado y sin Abreviaciones

Este es el archivo final, listo para copiar y pegar. Implementa la carga selectiva de fuentes de la manera más optimizada posible.

**Ruta:** `apps/portfolio-web/src/app/[lang]/layout.tsx`

```typescript


---
