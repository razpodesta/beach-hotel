/**
 * @file index.ts
 * @description Fachada Pública Soberana del Protocolo 33 (Gamification Engine).
 *              Orquesta la exposición atómica de tipos, catálogo de artefactos
 *              y motor matemático de ascensión.
 *              Refactorizado: Cumplimiento estricto de ESM (extensiones .js), 
 *              segregación de tipos para empaquetado de ultra-performance y
 *              alineación con Next.js 15 Standard.
 * @version 4.0 - Strict ESM & Type Segregation
 * @author Raz Podestá - Staff Engineer, MetaShark Tech
 */

/**
 * 1. CONTRATOS DE DATOS (Type-Only Exports)
 * @pilar_III: Seguridad de Tipos Absoluta.
 * @description Exportación exclusiva de tipos para garantizar Zero-Runtime overhead
 *              en el bundle del cliente. Cumple con 'verbatimModuleSyntax'.
 */
export type { 
  House, 
  Rarity, 
  ArtifactDefinition, 
  LevelDefinition, 
  UserProgress 
} from './lib/types.js';

/**
 * 2. EL CÓDICE (Sovereign Assets)
 * @description Catálogo inmutable de artefactos y utilidades de búsqueda.
 *              Fuente de verdad (SSoT) para el patrimonio digital del usuario.
 */
export { 
  ARTIFACTS, 
  getArtifactById 
} from './lib/codex.js';

/**
 * 3. MOTOR DE ASCENSIÓN (Math Engine)
 * @description Lógica pura para el cálculo de niveles y progresión de XP.
 *              Optimizado para ejecución en el Edge y Server Actions.
 */
export { 
  LEVELS, 
  calculateProgress 
} from './lib/engine.js';

/**
 * @pilar_IV: Observabilidad Forense.
 * Registro de versión del orquestador: P33_ENGINE_V4.0_STABLE
 */