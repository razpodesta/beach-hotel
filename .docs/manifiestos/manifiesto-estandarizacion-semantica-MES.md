Manifiesto de Estandarización Semántica (MES)
Estatus: ACTIVO | Prioridad: Alta
Objetivo: Sustitución gradual de terminología metafórica ("Santuario", "Soberano", "Heimdall") por semántica técnica estándar de la industria.
1. La Regla de Oro: Claridad antes que Creatividad
En el software de alto rendimiento, el código es el documento principal. La nomenclatura debe ser auto-explicativa, predecible y alineada con la documentación oficial de los frameworks utilizados (React, Next.js, Payload CMS, Supabase).
2. Mapa de Conversión Semántica (Tabla de Sustitución)
Esta tabla es nuestra guía de refactorización. Cada vez que toquemos un archivo, aplicaremos estas equivalencias:
Término "Santuario" (Informal)	Término "Enterprise" (Estándar)	Justificación técnica
Sovereign / Soberano	Authenticated / Authorized	Alineación con estándares de RBAC y Security.
Sanctuary	Core / Protected / Domain	Claridad sobre el alcance del módulo.
Heimdall	Telemetry / Audit / Logger	Descripción funcional del comportamiento.
Silo A/B/C/D	Domain/Module/{Name}	Estandarización de arquitectura modular.
Handshake	Connection / Sync / Auth	Terminología de red y protocolos estándar.
DNA / Génesis	Core / Init / Base	Precisión en la jerarquía de carga.
Portal	Admin / Dashboard	Clasificación funcional clara.
RazTokens / RZB	ExperiencePoints / XP	Claridad del concepto para integraciones externas.
3. Protocolo de Refactorización Gradual (Refactor Pipeline)
Para evitar regressions y bloqueos en el pipeline de build, seguiremos este protocolo:
Auditoría de Impacto: Antes de renombrar, identificaremos todas las referencias (imports, variables, claves de base de datos) del término a sustituir.
Abstracción de Compatibilidad:
Si el cambio es en un export público o contrato de API, primero crearemos un alias o export temporal que apunte al nuevo nombre.
Marcaremos el nombre antiguo como @deprecated usando JSDoc.
Refactorización del Consumidor: Actualizaremos los componentes apps/ y packages/ para utilizar el nuevo estándar.
Limpieza: Una vez que el uso del término antiguo sea cero, eliminaremos las referencias y aliases temporales.
Actualización de Contratos SSoT: Si el cambio afecta un esquema de Zod o un contrato de base de datos, realizaremos una migración controlada de esquemas, manteniendo la compatibilidad con el JSON existente mediante transformaciones durante la carga (en get-dictionary.ts).
4. Instrucción de Ejecución para la IA
"A partir de este momento, cuando detectes terminología 'Santuario' o 'Soberano', debes proponer inmediatamente la refactorización hacia el equivalente técnico definido en la Tabla de Conversión. Si la refactorización implica cambios en la base de datos o contratos de API, debes incluir la estrategia de migración (ej. cómo transformamos los datos existentes o cómo mantenemos la retrocompatibilidad)."

---