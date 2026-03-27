/**
 * @file packages/protocol-33/src/index.ts
 * @description Fachada Pública Soberana del Protocolo 33 (Gamification Engine).
 *              Orquesta la exposición atómica de tipos, catálogo de artefactos
 *              y motor matemático de ascensión.
 *              Nivelado para resolución nativa en Next.js 15 y Vercel Build Sync.
 * @version 3.0 - Type Segregation & Forensic Documentation
 * @author Raz Podestá - MetaShark Tech
 */

/**
 * 1. CONTRATOS DE DATOS (Type-Only Exports)
 * @pilar III: Seguridad de Tipos. Uso de 'export type' para garantizar la 
 * elisión de tipos en el bundle de cliente (verbatimModuleSyntax compliance).
 */
export type { 
  House, 
  Rarity, 
  ArtifactDefinition, 
  LevelDefinition, 
  UserProgress 
} from './lib/types';

/**
 * 2. EL CÓDICE (Sovereign Assets)
 * @description Catálogo inmutable de artefactos y utilidades de búsqueda.
 */
export { 
  ARTIFACTS, 
  getArtifactById 
} from './lib/codex';

/**
 * 3. MOTOR DE ASCENSIÓN (Math Engine)
 * @description Lógica pura para el cálculo de niveles y progresión de XP.
 */
export { 
  LEVELS, 
  calculateProgress 
} from './lib/engine';