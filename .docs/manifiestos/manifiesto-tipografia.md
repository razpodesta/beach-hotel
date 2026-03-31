Manifiesto de Tipografía: La Voz del Portafolio
Versión: 1.0
Fecha: 2025-11-07
1. Filosofía
La tipografía es un pilar fundamental de la identidad de este portafolio. No es solo texto; es la voz visual que comunica modernidad, precisión técnica y creatividad. Nuestra filosofía se basa en dos principios:
Dualidad y Contraste: Utilizamos un sistema de dos familias de fuentes. Una audaz y con carácter para el impacto, y otra limpia y funcional para la claridad. Este contraste guía la atención del usuario y crea una jerarquía visual natural.
Rendimiento Inquebrantable: Todas las fuentes se alojan localmente y se cargan mediante next/font en el formato web optimizado woff2. Se cargan únicamente los pesos estrictamente necesarios para minimizar el tiempo de carga y garantizar una puntuación perfecta en los Core Web Vitals.
2. Las Fuentes Oficiales
2.1. Voz de Impacto: Clash Display
Familia: font-display
Rol: Títulos principales, encabezados de sección, y cualquier texto que necesite capturar la atención de inmediato. Su uso debe ser medido y deliberado para mantener su fuerza.
Pesos Cargados: Regular (400), Bold (700).
2.2. Voz de Claridad: Satoshi
Familia: font-sans
Rol: Cuerpo de texto, párrafos, descripciones de proyectos, etiquetas, botones y todos los elementos de la interfaz de usuario. Su diseño neutro y legible garantiza una experiencia de usuario cómoda.
Pesos Cargados: Fuente variable (todos los pesos disponibles con una sola carga de archivo).
3. Jerarquía y Sistema de Uso
La siguiente tabla define el uso canónico de las fuentes y pesos en todo el sitio. La adherencia a esta guía es obligatoria para mantener la coherencia visual.
Nivel / Elemento	Fuente	Peso (Weight)	Clase de Tailwind	Caso de Uso Específico
Título Principal (Hero)	Clash Display	Bold (700)	font-display font-bold	El título principal en el HeroCarousel (ej. "RAZ-LINEUP").
Título de Sección (H2)	Clash Display	Bold (700)	font-display font-bold	"Proyectos Destacados", "Entre em Contato".
Título de Tarjeta (H3)	Clash Display	Regular (400)	font-display font-normal	El título de cada ProjectCard.
UI Decorativa (HUD)	Clash Display	Regular (400)	font-display font-normal	Coordenadas y datos en el HeroCarousel.
Párrafo / Cuerpo	Satoshi	Regular (400)	font-sans font-normal	Descripciones de proyectos, texto del formulario.
Enlaces / Botones	Satoshi	Medium (500)	font-sans font-medium	Elementos de navegación, botones de acción.
Etiquetas (Tags)	Satoshi	Medium (500)	font-sans font-medium	Las etiquetas de tecnología en cada ProjectCard.
Texto Enfatizado	Satoshi	Bold (700)	font-sans font-bold	Para resaltar palabras clave dentro de un párrafo.
4. Reglas Inquebrantables
No usar Clash Display para párrafos largos. Su legibilidad disminuye en tamaños pequeños y bloques de texto extensos.
No cargar pesos adicionales sin justificación de diseño y sin actualizar este manifiesto. Cada font-weight es un costo de rendimiento.
No usar más de dos pesos de Clash Display en una misma vista de pantalla para evitar la sobrecarga visual.

---
ACTUALIZACION DEL MANIFUSSTO:
# Manifiesto de Tipografía: Sincronía Sensorial v2.1
**Versión:** 2.1 (Hybrid Performance Standard)
**Estado:** ACTIVO / OBLIGATORIO
**Autor:** Raz Podestá - MetaShark Tech

## 1. Filosofía: "Contraste entre Ingeniería y Hospitalidad"
La tipografía es una interfaz sensorial. Implementamos un sistema híbrido que garantiza el **Performance de Grado A** y la **Soberanía de Marca**, eliminando dependencias de binarios frágiles para la lectura masiva.

## 2. El Códice Tipográfico (Oxygen Typography)

### I. Voz de Impacto Boutique: **Sora** (Google Font)
- **Familia:** `font-display` / `--font-clash`
- **Uso:** Títulos Hero, Encabezados de Sección, Badges de Lujo.
- **Razón:** Geometría moderna que comunica precisión técnica y sofisticación.
- **Pesos:** 400 (Regular), 600 (Semi-bold), 700 (Bold), 800 (Extra-bold).

### II. Voz de Claridad Técnica: **Inter** (Google Font)
- **Familia:** `font-sans` / `--font-inter`
- **Uso:** Cuerpo de texto, Botones, Inputs, Telemetría.
- **Razón:** Máxima legibilidad en dispositivos móviles. Estética de "Dashboard de Ingeniería".
- **Pesos:** Variable (Carga atómica de todos los pesos necesarios).

### III. Voz de Identidad Soberana: **Dicaten** (Local Font)
- **Familia:** `font-signature` / `--font-signature`
- **Uso:** Logos, Firmas de autoría, Detalles de lujo.
- **Formato:** `.woff2` (Binario real de marca).

## 3. Jerarquía y Sistema de Uso (MACS Compliance)

| Nivel / Elemento           | Token CSS           | Peso (Weight) | Caso de Uso                                  |
| :------------------------- | :------------------ | :------------ | :------------------------------------------- |
| **Título Principal (Hero)**| `font-display`      | 800           | Impacto cinemático en HeroCarousel.          |
| **Título de Sección (H2)** | `font-display`      | 700           | "Bóveda Cloud S3", "Nossa História".         |
| **Cuerpo de Texto**        | `font-sans`         | 400           | Artículos del Journal, descripciones.        |
| **Telemetría (HUD)**       | `font-sans`         | 600           | Coordenadas, I.P. de origen, clima.          |
| **Firma de Marca**         | `font-signature`    | 400           | Logo del Header y créditos de autoría.       |

## 4. Reglas Inquebrantables de Performance

1. **Anti-404:** Queda prohibida la carga de fuentes locales que no sean la Signature. Todo el texto de UI debe ser servido por el motor de Google Fonts de Next.js para evitar corrupción de Git LFS.
2. **Anti-CLS:** Uso obligatorio de `display: 'swap'` para reservar el espacio del texto antes de la hidratación.
3. **Sincronía OKLCH:** El suavizado de fuente (`antialiased`) es obligatorio para mantener la nitidez en el contraste de atmósfera Día/Noche.

---
**Certificación de Calidad:**
Este sistema garantiza un LCP (Largest Contentful Paint) inferior a 1.2s y la eliminación total de errores OTS en el navegador.

---


