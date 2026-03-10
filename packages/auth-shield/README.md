# Convenciones: Auth-Shield
**Versión:** 1.0
**Tipo:** Librería de Seguridad / Core

## 1. Propósito
Proveer mecanismos criptográficos y de tokenización agnósticos a la base de datos. Esta librería NO gestiona usuarios ni bases de datos; solo gestiona credenciales y tokens.

## 2. Reglas de Implementación
1.  **Cero Dependencias de Dominio:** No debe saber qué es un "User" de Sequelize o Supabase. Trabaja con interfaces puras (`AuthUser`, `TokenPayload`).
2.  **Manejo de Errores:**
    *   No lanzar excepciones silenciosas.
    *   Las funciones de verificación deben retornar `null` o lanzar errores tipados (`AuthError`).
3.  **Seguridad:**
    *   Los secretos (JWT_SECRET) deben pasarse como argumentos a las funciones o configurarse en una clase de inicialización, NO leerse directamente de `process.env` para maximizar la portabilidad.

## 3. Stack Tecnológico
*   `jsonwebtoken`: Para firma y verificación (Estándar RFC 7519).
*   `bcryptjs`: Para hashing de contraseñas.

---


