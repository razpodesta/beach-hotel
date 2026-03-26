🏆 Protocolo 33: Sovereign Gamification & Reputation Engine
Versión: 2.0 (Next-Gen Infrastructure)
Tipo: Motor Lógico Isomórfico (Core Logic)
Alcance: Monorepo MetaShark (Hotel, Festival & Sanctuary)
Estatus: SSoT (Única Fuente de Verdad para Reglas de Negocio)
1. Misión y Propósito de Élite
El Protocolo 33 no es un sistema de recompensas tradicional; es un motor de Herencia y Reputación Digital. Su propósito es orquestar la transición del usuario desde un simple "Visitante" a un "Huésped Soberano" mediante la cuantificación de su comportamiento, compromiso e interacciones con el ecosistema MetaShark.
Centraliza de forma inmutable:
El Códice: Catálogo maestro de Artefactos Digitales.
La Tabla de Ascensión: Lógica matemática de niveles y experiencia (XP).
La Economía RZB: Reglas de intercambio y valor de los RazTokens.
2. Los 5 Mandamientos de Implementación
I. Isomorfismo y Pureza (Zero-Gravity Logic)
El núcleo de esta librería debe ser estrictamente puro.
Prohibición: No puede importar nada de fs, http, react, o next.
Garantía: Debe ser ejecutable con la misma precisión en un Edge Worker (Vercel), en el Navegador (Next.js Client), o en un Script de Servidor (Node.js).
II. Determinismo Matemático
A una misma entrada (XP acumulada), el motor DEBE devolver siempre la misma salida (Nivel/Rango). La lógica de progresión es una función pura.
III. Inmutabilidad de Datos (The Codex)
Todas las definiciones de artefactos, rarezas y casas se definen mediante as const. Esto permite que TypeScript genere tipos literales exactos, eliminando el uso de strings mágicos y garantizando seguridad en tiempo de compilación.
IV. Agnosticismo de Persistencia
Esta librería no sabe dónde se guardan los datos. Solo provee los esquemas y las funciones de cálculo. La responsabilidad de hablar con Supabase o Payload CMS recae en las aplicaciones que consumen esta librería.
V. Exhaustividad de Tipos (Discriminated Unions)
Cada ID de artefacto o nombre de Casa debe ser parte de un Union Type. No se aceptan parámetros de tipo string genéricos en funciones críticas.
3. Arquitectura de Datos (Estructura de Próxima Generación)
🏛️ Las Tres Casas (Domains)
El sistema divide el conocimiento y la reputación en tres linajes:
ARCHITECTS (Lógica/Infra): Premia la estabilidad, la estructura y el dominio técnico.
WEAVERS (Experiencia/UI): Premia la estética, la fluidez y la empatía con la interfaz.
ANOMALIES (Caos/Innovación): Premia el descubrimiento de bugs, la creatividad lateral y el humor dev.
💎 Jerarquía de Rareza (Rarity Matrix)
Define multiplicadores de valor y límites de suministro:
COMMON (x1): Activos de interacción diaria.
RARE (x5): Logros de compromiso recurrente.
LEGENDARY (x25): Activos únicos de alta fidelidad.
MYTHIC (x100): Reservado para hitos históricos del Festival.
UNIQUE (Suministro: 1): Artefactos soberanos e irrepetibles.
4. Casos de Uso y Funcionalidades de Élite
A. Sincronización con "Nos3" (Behavioral Engagement)
El motor está diseñado para recibir señales del sistema de rastreo de comportamiento.
Caso: El usuario lee 5 artículos completos del Concierge Journal.
Acción: El motor calcula la recompensa y emite el contrato para desbloquear el artefacto "Pergamino de Curaduría".
B. Dinámica de Precios Dinámicos (RZB Economy)
Los RazTokens (RZB) pueden influir en el sistema de reservas.
Caso: Un huúsped con Nivel 33 (Rango: Oracle) intenta reservar una suite.
Acción: La aplicación consulta el protocol-33 para validar el multiplicador de rango y aplicar beneficios exclusivos en tiempo real.
C. Gating de Contenido en el Festival
Caso: Acceso a la "Boat Party: The Deep Tech".
Acción: El sistema valida si el inventario del usuario contiene el artefacto necesario de la Casa de los Arquitectos.
5. Hoja de Ruta de Refactorización (Cirugía de Purificación)
Para alinear el paquete con la arquitectura Source-First y el Dual-Mode Resolution, ejecutaremos:
Purgado de React: Eliminación de cualquier rastro de .tsx y dependencias de UI. El paquete pasa de ser una "Lib de Componentes" a una "Lib de Inteligencia".
Modularización del Core:
src/lib/codex.ts: Constantes y definiciones de activos.
src/lib/engine.ts: Funciones de cálculo de XP y niveles.
src/lib/types.ts: Contratos de interfaces e inferencias de Zod.
Exposición de API Pública: El src/index.ts actuará como el único punto de entrada, exportando tanto la lógica como los tipos.
6. Ejemplo de Evolución (Inferencia de Próxima Generación)
El motor evolucionará para soportar "Composability":
Permitir que dos artefactos se fusionen para crear uno de mayor rareza, cuya lógica de validación residirá en una función pura dentro de este paquete.
Firma de Compromiso:
Al implementar este manifiesto, certificamos que el Protocolo 33 es un sistema agnóstico, escalable y diseñado para durar décadas como el cerebro de reputación de la marca.

---

