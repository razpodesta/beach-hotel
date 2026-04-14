# Documento Conceptual: Centro de Mando Perimetral (Heimdall HUD)

## 1. METADATOS DEL APARATO
- **Ruta Espejo:** `.documentation/apps/portfolio-web/src/components/ui/VisitorHud/VisitorHud.md`
- **Ruta Origen:** `apps/portfolio-web/src/components/ui/VisitorHud/VisitorHud.tsx`
- **Tipo de Aparato:** Orquestador de Telemetría Flotante / Dashboard de Identidad.
- **Silo / Dominio:** Telemetría y Observabilidad / Identidad (Silo D).

## 2. VISIÓN HOLÍSTICA E INTEGRACIÓN AL ECOSISTEMA
El `VisitorHud` es el punto de convergencia entre los datos ambientales del mundo real y la reputación digital del usuario. No es solo un widget; es una ventana al **Protocolo Heimdall**:
- **Sincronía de Estado (Zustand):** Escucha la bóveda `ui.store.ts` para persistir su visibilidad y posición en el viewport.
- **Handshake de Identidad (P33):** Detecta si la sesión es anónima o autenticada, transformando su interfaz de una invitación de registro (`HudGuestView`) a un monitor de progreso de RazTokens (`HudIdentity`).
- **Integración Geo-Meteo:** Consume el hook `useVisitorData` para proyectar el clima de Canasvieiras y la IP de origen, reforzando la narrativa de "Santuario Conectado".

## 3. ANATOMÍA FUNCIONAL
1. **Inercia Física (Drag & Motion):** Utiliza Framer Motion para permitir al usuario reposicionar el aparato mediante gestos, con restricciones de fricción que simulan un material de alta tecnología.
2. **Navegación Táctica (Tab System):** Segmenta la información en dos nodos: *Identity* (Rango y XP) y *Telemetry* (Señales de red y ambiente).
3. **Conciencia de Hidratación:** Implementa `useSyncExternalStore` para asegurar que el HUD solo se materialice una vez que el cliente está listo, evitando desajustes visuales (Layout Shifts).
4. **Resiliencia de Señal:** Maneja estados de error y carga (`geoLoading`, `geoError`) con señalética visual dedicada (`ShieldAlert`).

## 4. APORTE AL ECOSISTEMA SOBERANO
Este aparato eleva la **Autoridad Técnica (E-E-A-T)** de la plataforma. Al mostrar telemetría en tiempo real, MetaShark comunica que el hotel opera bajo una infraestructura de monitoreo constante, mejorando la percepción de seguridad y modernidad del huésped.

## 5. HORIZONTE DE EVOLUCIÓN (Mejoras Futuras)
1. **Pulse Stream (WebSockets):** Integrar una conexión persistente para mostrar la ocupación del hotel o alertas del festival en vivo mediante pequeñas notificaciones dentro del HUD.
2. **Quick Actions Contextuales:** Añadir disparadores rápidos basados en la ubicación del usuario (ej: si está en el hotel, mostrar botón de "Abrir Cerradura Digital").

---

