# Blueprint: Plataforma Hotelera
**Slug:** `plataformas-hoteleras`
**Objetivo:** Venta de experiencias y motor de reservas fácil.

## 1. Arquitectura Visual
*   **Estilo:** Editorial, Fotografía a Sangre, Lujo.
*   **Tipografía:** *Cinzel* (Clásico) + *Montserrat* (Moderno).
*   **Color Primario:** Lavanda (#c084fc).

## 2. Mapa de Secciones (Componentes a Construir)
1.  **Booking Hero:**
    *   *Componente:* `BookingEngineHero.tsx`
    *   *Specs:* Imagen inspiradora + Widget de búsqueda de fechas (Datepicker) flotante.
2.  **Room Gallery (Carousel):**
    *   *Componente:* `RoomShowcase.tsx`
    *   *Specs:* Carrusel de habitaciones con detalles de amenidades y precio.
3.  **Amenities Grid:**
    *   *Componente:* `IconGrid.tsx`
    *   *Specs:* Grid limpio de iconos (Spa, Wifi, Pool) con descripciones cortas.
4.  **Experiences (Parallax):**
    *   *Componente:* `ParallaxSection.tsx`
    *   *Specs:* Secciones de imagen/texto alternadas con efecto parallax suave.
5.  **Reviews Slider:**
    *   *Componente:* `TestimonialSlider.tsx`
    *   *Specs:* Reseñas de TripAdvisor/Google simuladas.

## 3. Requisitos Técnicos
*   Manejo de fechas con `date-fns`.
*   Galería de imágenes optimizada (Next/Image).