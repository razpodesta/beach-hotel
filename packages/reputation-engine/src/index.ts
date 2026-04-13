/**
 * @file packages/protocol-33/src/index.ts
 * @description Fachada Pública Soberana del Protocolo 33 (Gamification Engine).
 *              Refactorizado: Exposición del tipo Artifact saneado.
 * @version 4.2 - Public API Sync
 * @author Raz Podestá -  MetaShark Tech
 */

/**
 * 1. CONTRATOS DE DATOS (Type-Only Exports)
 * @pilar_III: Seguridad de Tipos Absoluta.
 */
export type { 
  House, 
  Rarity, 
  Artifact, // Nivelado: Coincide con la expectativa del consumidor
  LevelDefinition, 
  UserProgress 
} from './lib/types';

/**
 * 2. EL CÓDICE (Sovereign Assets)
 */
export { 
  ARTIFACTS, 
  getArtifactById 
} from './lib/codex';

/**
 * 3. MOTOR DE ASCENSIÓN (Math Engine)
 */
export { 
  LEVELS, 
  calculateProgress 
} from './lib/engine';

/**
 * @pilar_IV: Observabilidad Forense.
 * Versión de API sincronizada: P33_ENGINE_V4.2_STABLE
 */