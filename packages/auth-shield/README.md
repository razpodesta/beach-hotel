🛡️ @metashark/auth-shield: The Cryptographic Vault
Versión: 2.0 (Elite Security Infrastructure)
Tipo: Motor Criptográfico y de Identidad (Core Security)
Alcance: Transversal (Middleware, Server Actions, CMS & Scripts)
Estatus: CRÍTICO - Cualquier vulnerabilidad aquí compromete el ecosistema.
1. Misión y Propósito de Élite
auth-shield constituye el perímetro de seguridad digital del monorepo. Su misión es proveer mecanismos de cifrado, hashing y tokenización bajo un paradigma de Soberanía Apátrida: la librería posee la inteligencia para validar y firmar, pero carece de memoria (base de datos), lo que la hace 100% portable y resistente a ataques de inyección de infraestructura.
Centraliza de forma inmutable:
Mecanismos de Hashing: Implementación de algoritmos de derivación de claves (KDF).
Orquestación de JWT: Ciclo de vida completo de tokens (Firma, Verificación, Rotación).
Contratos de Payload: Definición estricta de qué constituye una "Identidad" en MetaShark.
2. Los 5 Mandamientos de Implementación
I. Agnosticismo de Dominio (Pure Logic)
La librería no tiene conocimiento de modelos de base de datos (User, Admin). Opera exclusivamente con Interfaces de Identidad Puras.
Prohibición: No puede importar nada de @metashark/cms-core o supabase.
Garantía: El contrato de datos es la única interfaz de comunicación.
II. Manejo de Errores Forense
La seguridad no admite ambigüedad. Esta librería prohíbe los retornos silenciosos o valores mágicos.
Regla: Si un token es inválido por expiración, se emite un error específico de expiración. Si es inválido por firma, se emite un error de manipulación.
Fail-Fast: Ante cualquier anomalía en los argumentos (ej: secreto muy corto), la librería aborta la ejecución inmediatamente.
III. Patrón de Secretos Sellados (Sealed Secrets)
Para maximizar la seguridad en entornos de CI/CD y despliegues multi-región:
Regla: La librería prohíbe el acceso directo a process.env.
Mecánica: Los secretos deben ser inyectados mediante constructores o argumentos de función, asegurando que la aplicación anfitriona sea la responsable de la gestión de bóvedas (ej: GitHub Secrets o Vercel Env Vars).
IV. Resiliencia en el Edge (Next-Gen Performance)
La infraestructura de hospitalidad boutique requiere validaciones en el Edge (Vercel) para evitar latencia en el check-in digital.
Stack: Se utiliza bcryptjs en lugar de bcrypt nativo para garantizar compatibilidad total con el entorno restringido de Next.js Middleware/Edge Runtime sin necesidad de compilación binaria.
V. Inmutabilidad de Payloads
Una vez que un token es firmado, su estructura interna debe ser predecible y estar protegida contra la contaminación de propiedades. Los esquemas se validan antes de la firma.
3. Stack Tecnológico de Grado Militar
Herramienta	Función	Justificación
jsonwebtoken	Tokenización	Estándar RFC 7519. Implementación robusta para JWT.
bcryptjs	Hashing (KDF)	Seguridad contra ataques de fuerza bruta. 100% JS compatible con Edge.
tslib	Helpers	Optimización del tamaño del bundle en el frontend.
4. Casos de Uso de Próxima Generación
A. Blindaje de Middleware (Next.js 15)
El Middleware consume auth-shield para validar la sesión del huésped antes de renderizar el HUD de telemetría, operando en el Source-First mode para máxima velocidad.
B. Hashing de Contraseñas en el CMS
Cuando un nuevo Administrador es creado en Payload CMS, el Hook utiliza hashPassword para asegurar que la credencial nunca se guarde en texto plano en la base de datos de producción.
C. Gating de Reputación (Protocolo 33)
Capacidad para incluir Claims personalizados dentro del JWT que representen el Nivel de Reputación, permitiendo que la App tome decisiones de UI sin consultar la base de datos en cada render.
5. Hoja de Ruta de Evolución
Fase A: Implementación de Refresh Tokens mediante rotación de secretos.
Fase B: Soporte para WebAuthn (Biometría), preparando el hotel para un futuro sin contraseñas (Passwordless).
Fase C: Integración de ZKP (Zero-Knowledge Proofs) para validación de mayoría de edad sin revelar la fecha de nacimiento real del huésped.
Veredicto de Arquitectura:
auth-shield no es una utilidad; es el sistema inmunológico del ecosistema. Su diseño garantiza que, aunque la base de datos fuera comprometida, la lógica de validación de identidad permanezca intacta y segura bajo el estándar MetaShark.

---

