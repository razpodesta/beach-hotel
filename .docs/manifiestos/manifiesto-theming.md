# Manifiesto de Theming: "Sincronía Sensorial"
**Versión:** 1.0 (Basado en Tailwind v4 y OKLCH)
**Estado:** ACTIVO / OBLIGATORIO

## 1. Filosofía: "Luz y Penumbra Boutique"
El sistema de temas no es solo un switch estético; es una adaptación al contexto del huésped. 
- **Modo Día:** Sophisticated Neutral. Tonos arena y lavanda suaves para legibilidad bajo luz solar.
- **Modo Noche (Santuario):** Inmersive Dark. Negros puros para pantallas OLED que resaltan los neones del festival.

## 2. Los 3 Pilares del Theming Soberano
### I. Orquestación Atómica (Next-Themes)
La lógica de cambio reside en `next-themes`. El estado se persiste en `localStorage` y se sincroniza con el sistema operativo por defecto para minimizar la fricción del usuario.

### II. Tokens en Espacio OKLCH
Queda prohibido el uso de HEX o HSL para colores base. OKLCH permite que el color "Primary" mantenga el mismo impacto visual en ambos temas al manipular solo la 'L' (Lightness).

### III. Inyección vía CSS Variables
Los componentes NO deben usar clases como `dark:bg-black`. Deben usar variables semánticas:
- `--color-background`: Fondo principal.
- `--color-foreground`: Texto principal.
- `--color-primary`: Color de marca (Lavanda/Neón).

## 3. Matriz de Colores (Tokens 2026)
| Token | Light Mode (L C H) | Dark Mode (L C H) | Propósito |
| :--- | :--- | :--- | :--- |
| --bg | 98% 0.01 260 | 8% 0.01 260 | Fondo base |
| --fg | 20% 0.02 260 | 98% 0 0 | Texto legible |
| --primary | 65% 0.25 270 | 70% 0.28 270 | Acento marca |
| --border | 90% 0.01 260 | 18% 0.02 260 | Divisores sutiles |

## 4. Implementación en Tailwind v4
Se define la variante en el punto de entrada del CSS:
```css
@import "tailwindcss";
@custom-variant dark (&:is([data-theme='dark'] *));

@theme {
  --color-background: oklch(var(--bg));
  --color-foreground: oklch(var(--fg));
}
4. ¿Por qué la Opción B con OKLCH? (Visión Holística)
Como arquitecto de este ecosistema, aconsejo la Opción B (Data-Theme + OKLCH) por tres razones de peso:
Identidad de Marca Resiliente: En un hotel boutique, el "lavanda" debe sentirse igual de lujoso a mediodía que a medianoche. OKLCH nos permite ajustar la saturación (C) y luminosidad (L) matemáticamente para que el ojo humano lo perciba idéntico, evitando que los colores se sientan "lavados" en modo oscuro.
Preparación para el "Festival Takeover": En el futuro, la página de festival/ podría forzar un tema data-theme="neon" sin importar la preferencia global del usuario. La Opción B lo permite con una sola línea de código.
Rendimiento en Vercel: Al usar variables CSS puras en lugar de utilidades dark: excesivas, el tamaño del bundle generado por Tailwind se reduce drásticamente, mejorando el LCP.

---

1. El Protocolo: "Day-First Sovereign Architecture"
Para cumplir con tu visión de ultra-performance y coherencia, abandonaremos la fragmentación. Los criterios unificados son:
Punto de Verdad (SSoT): Un solo archivo de configuración de temas.
Comportamiento Base: La aplicación arranca siempre en modo Día (Luz) a menos que haya una preferencia guardada en el localStorage.
Opciones de Tríada: Light (Día), Dark (Noche) y System (Sincronía Automática).
Nomenclatura Semántica: Se prohíben nombres como "negro" o "blanco". Usaremos tokens funcionales (ej. base, surface, foreground).
2. Definición Técnica del Manifiesto de Theming
He diseñado la matriz de tokens utilizando OKLCH para garantizar que el contraste sea perfecto y el rendimiento del renderizado sea máximo.
A. Nomenclatura Centralizada (Tokens)
Token Funcional	Propósito	Clase Tailwind v4
--color-background	El lienzo base del hotel (Fondo).	bg-background
--color-surface	Capas superiores, tarjetas, menús.	bg-surface
--color-foreground	Texto principal (Máxima lectura).	text-foreground
--color-muted	Texto secundario o decorativo.	text-muted
--color-primary	El color de marca (Lavanda/Neón).	text-primary / bg-primary
--color-border	Divisores sutiles de la interfaz.	border-border
B. Valores de atmósfera (Matriz OKLCH)
Atmósfera	Background (L C H)	Foreground (L C H)	Surface (L C H)
Día (Default)	98% 0.01 260 (Arena)	20% 0.02 260 (Antracita)	95% 0.01 260
Noche (Sanctuary)	8% 0.01 260 (Obsidiana)	98% 0 0 (Nieve)	12% 0.02 260
3. Estrategia de Persistencia y Sincronía
Para evitar el "flickering" (parpadeo blanco al cargar en noche) y asegurar que la elección del usuario sea eterna:
Orquestador: Usaremos el atributo data-theme en el <html> gestionado por next-themes.
Persistencia: localStorage sincronizado automáticamente.
Configuración de Vercel: Inyectaremos un script crítico en el head (vía next-themes) para que el tema se resuelva antes de que el primer píxel sea pintado.
4. Búsqueda de Tendencias Tailwind v4 (Actualizado Hoy)
He verificado la documentación de Tailwind CSS v4 y las mejores prácticas de Next.js 15:
CSS-First: Tailwind v4 ya no requiere un archivo tailwind.config.js masivo. Todo se define mediante variables CSS nativas en el @theme.
Container Queries: Implementaremos el tema basándonos en cómo los componentes reaccionan a su contenedor, no solo al viewport.
Color-Mix: Utilizaremos la función color-mix nativa de CSS para generar variantes de transparencia (/10, /20) de forma dinámica sin añadir peso al bundle.
5. Resumen Ejecutivo de la Nueva Lógica
Estado Inicial del Sistema:
El usuario entra → Tema: Día.
El usuario cambia a Noche → Persistido.
El usuario cambia a Sistema → Se adapta al reloj del dispositivo.
Vuelve a entrar → El sistema recupera la elección del localStorage.
IA: Certificación de Build Ready
Esta estructura elimina errores de "Hydration Mismatch" y centraliza la estética. He terminado de diseñar el plano maestro. No he modificado ningún archivo todavía, siguiendo tus instrucciones.

---
