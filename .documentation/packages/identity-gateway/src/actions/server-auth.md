Documentación Conceptual: Orquestador de Acceso Soberano (Server-Auth Actions)

1. METADATOS DEL APARATO
Ruta Espejo: .documentation/packages/identity-gateway/src/actions/server-auth.md
Ruta Origen: packages/identity-gateway/src/actions/server-auth.ts
Tipo de Aparato: Motor de Autenticación / Server Actions (Backend Interface).
Silo / Dominio: Seguridad (Identity Gateway) / Identidad y Acceso.

2. VISIÓN HOLÍSTICA E INTEGRACIÓN AL ECOSISTEMA
El server-auth.ts constituye el Corazón Criptográfico del Ecosistema MetaShark. Su función principal es servir como el mediador (Bridge) entre la infraestructura de identidad externa (Supabase Auth) y las necesidades de lógica de negocio internas (Payload CMS, Registro de Usuarios, Protocolo 33).

Inversión de Control (IoC): Este módulo no decide qué sucede con los datos del usuario tras la autenticación. Simplemente verifica la identidad y emite "Signals" (Acciones de Servidor). El Host (ej. portfolio-web) es quien decide si sincronizar ese usuario en el CMS, disparar webhooks o asignar reputación.

Seguridad L0: Está diseñado para ser a prueba de manipulaciones, utilizando el reCAPTCHA v3 como filtro preventivo antes de que cualquier credencial toque el servidor, lo que protege los recursos de cómputo de la plataforma contra ataques de fuerza bruta o bots automatizados.

Independencia de Entorno: Utiliza @supabase/ssr para manejar cookies de forma segura, garantizando que el estado de la sesión sea persistente tanto en el borde (Edge Runtime) como en funciones de servidor tradicionales.

3. ANATOMÍA FUNCIONAL

getSupabaseServerClient (Fábrica de Clientes): Un servicio que abstrae la complejidad de la gestión de cookies entre el cliente y el servidor. Implementa un manejo seguro de errores para evitar que un fallo en las variables de entorno (SUPABASE_URL, ANON_KEY) bloquee el despliegue estático de la aplicación.

signInWithOAuthAction (Orquestador de Identidad Externa): Gestiona la compleja negociación de callbacks OAuth. Genera URLs de redirección dinámicas inyectando parámetros de estado (nextPath) para asegurar que el usuario retorne exactamente al punto donde inició su interacción.

loginAction (Gateway de Credenciales): Valida las credenciales contra el contrato loginCredentialsSchema (SSoT). Implementa una capa de "Gating Anti-Bot" mediante reCAPTCHA y retorna un objeto tipado AuthActionResult, asegurando que el Host pueda reaccionar con elegancia ante fallos (ej. 401, cuenta bloqueada).

registerAction (Reactor de Identidad): Crea un nuevo registro en la bóveda de Supabase inyectando metadatos soberanos (origin_node, trace_id). Este es el punto de entrada para nuevos integrantes del ecosistema.

signOutAction (Purga de Sesión): Elimina el estado persistente y los tokens del clúster de forma atómica.

4. APORTE AL ECOSISTEMA SOBERANO
Este aparato es el guardián de la entrada del Santuario. Sin él, el sistema no tendría forma de verificar la integridad del usuario, impidiendo que el Portal (/portal) opere. Al centralizar la autenticación aquí:

Blindaje de Datos: Se centraliza el manejo de credenciales, minimizando la superficie de ataque.

Trazabilidad (Heimdall): Cada intento de acceso o registro es logueado con un traceId único, permitiendo auditorías forenses inmediatas si el equipo de seguridad detecta comportamientos sospechosos o ataques de denegación de servicio (DDoS).

Consistencia i18n: Al manejar los resultados de forma tipada, permite que el AuthModal del frontend informe al usuario sobre errores específicos usando el diccionario validado, manteniendo la experiencia boutique incluso en momentos de error.

5. HORIZONTE DE EVOLUCIÓN (Mejoras Futuras)
Implementación de WebAuthn / Passkeys:

Justificación: Evolucionar más allá de las contraseñas hacia hardware de autenticación (TouchID/FaceID) reduciría drásticamente el riesgo de phishing y eliminaría la necesidad de recordar contraseñas, alineándose con el estándar de seguridad de grado bancario.

Mecanismo de "Impersonation" para Administradores:
Justificación: Añadir una acción administrativa que permita a un admin (S0/S1) iniciar sesión como otro nodo (Guest) por motivos de soporte, pero solo bajo un protocolo de logs estrictamente auditado y limitado por tiempo (Time-limited Session).