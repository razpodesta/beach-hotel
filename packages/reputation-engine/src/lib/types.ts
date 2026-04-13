/**
 * @file packages/protocol-33/src/lib/types.ts
 * @description Constitución de tipos y contratos inmutables para el motor 
 *              de gamificación y reputación (Protocolo 33).
 *              Refactorizado: Resolución de TS2305 mediante la unificación de 
 *              Artifact y ArtifactDefinition para sincronía con el Codex.
 * @version 2.2 - Type Contract Alignment & SSoT
 * @author Raz Podestá - MetaShark Tech
 */

/**
 * @description Casas (Linajes) de conocimiento dentro del ecosistema.
 * ARCHITECTS: Backend, Infraestructura, Lógica.
 * WEAVERS: Frontend, UX/UI, Estética.
 * ANOMALIES: Debugging, Creatividad Lateral, Cultura Dev.
 */
export const HOUSES = ['ARCHITECTS', 'WEAVERS', 'ANOMALIES'] as const;
export type House = (typeof HOUSES)[number];

/**
 * @description Niveles de rareza para los artefactos digitales.
 * Determinan el multiplicador de prestigio y los límites de suministro.
 */
export const RARITIES = ['COMMON', 'RARE', 'LEGENDARY', 'MYTHIC', 'UNIQUE'] as const;
export type Rarity = (typeof RARITIES)[number];

/**
 * @interface ArtifactDefinition
 * @description Contrato inmutable que define la identidad de un objeto coleccionable.
 * @pilar III: SSoT - Utilizado por el Codex para la definición de activos.
 */
export interface ArtifactDefinition {
  /** Identificador semántico único (ej: 'pato-goma-oro') */
  id: string;
  /** Nombre localizado o clave de diccionario i18n */
  name: string;
  /** Narrativa/Lore del objeto o clave de diccionario */
  description: string;
  /** Casa a la que pertenece el artefacto */
  house: House;
  /** Rareza asignada según el Códice */
  rarity: Rarity;
  /** Valor base en RazTokens (RZB) para la economía interna */
  baseValue: number;
  /** Suministro máximo. Si es undefined, el suministro es infinito */
  maxSupply?: number;
}

/**
 * @type Artifact
 * @description Alias de tipo para compatibilidad con el orquestador de UI y el store.
 * Resuelve la colisión de nomenclatura entre el motor lógico y la presentación.
 */
export type Artifact = ArtifactDefinition;

/**
 * @interface LevelDefinition
 * @description Define los umbrales de ascensión para los rangos de huéspedes.
 */
export interface LevelDefinition {
  /** Número entero de nivel (1-50) */
  level: number;
  /** Experiencia mínima requerida para alcanzar este nivel */
  minXp: number;
  /** Título honorífico asociado al rango */
  title: string;
}

/**
 * @interface UserProgress
 * @description Estado calculado del progreso de un usuario para visualización en el HUD.
 */
export interface UserProgress {
  /** Nivel actual alcanzado */
  currentLevel: number;
  /** Puntos de experiencia (XP) acumulados en total */
  currentXp: number;
  /** XP requerida para el siguiente nivel de ascensión */
  nextLevelXp: number;
  /** 
   * Porcentaje de progreso dentro del nivel actual (0.00 a 100.00).
   */
  progressPercent: number;
}