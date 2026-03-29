# Manifiesto del Portal Soberano y RBAC
**Versión:** 1.0 (Next-Gen SaaS Architecture)
**Estado:** OBLIGATORIO Y SSoT
**Autor:** Raz Podestá - MetaShark Tech

## 1. Filosofía: "Divulgación Progresiva y Cero Fricción"
El ecosistema no tendrá múltiples paneles de administración separados. Existirá un único `Portal Soberano` (`/portal`). La interfaz que el usuario ve se "esculpe" en tiempo real basándose en los *Claims* de su token JWT. Un Huésped ve su itinerario; un Administrador ve la telemetría del servidor.

## 2. La Matriz de Identidad (Los 5 Niveles de Ascensión)
La colección `Users` en el núcleo (Payload) y el motor criptográfico (`auth-shield`) deben soportar y blindar esta jerarquía:
1. **Developer (Nivel 0 - Root):** Acceso absoluto. Telemetría cruda, logs de Heimdall, gestión de esquemas.
2. **Admin (Nivel 1 - Manager):** Gestión del hotel, aprobación de reservas, subida de activos multimedia, edición del CMS.
3. **Operator (Nivel 2 - B2B):** Mayoristas de turismo. Acceso a tarifas netas, bloqueos de inventario masivo.
4. **Sponsor/VIP (Nivel 3 - Elite):** Acceso anticipado a eventos (Festival), beneficios del Protocolo 33.
5. **Guest (Nivel 4 - B2C):** Huésped estándar. Acceso a su perfil, inventario de artefactos y reservas propias.

## 3. Estrategia de Almacenamiento (The S3 Illusion)
Para sortear la naturaleza efímera de Vercel sin pagar costos masivos de AWS, el sistema utilizará el estándar S3 apuntando a **Supabase Storage**.
- **Ventaja:** Todo se procesa como S3, pero los datos viven en el mismo ecosistema que PostgreSQL.
- **Regla:** Ningún archivo multimedia se guarda localmente. Todo asset del CMS viaja directamente al Bucket `sanctuary-vault` en Supabase.

## 4. Seguridad de Interfaz (Edge Gating)
La protección no ocurre en el cliente (React). Ocurre en el perímetro (Vercel Edge Middleware). Si un `Guest` intenta acceder a una ruta de componente `Admin`, el servidor ni siquiera envía el JavaScript; responde con un 404 o redirige a su área permitida.

---

