/**
 * @file packages/protocol-33/src/lib/engine.ts
 * @description Motor matemático del Protocolo 33. Gestiona la curva de experiencia (XP)
 *              y la ascensión de rangos de los huéspedes.
 *              Nivelado: Importaciones de tipo explícitas para cumplimiento de 
 *              verbatimModuleSyntax y prevención de fugas en el empaquetado ESM.
 * @version 2.0 - Strict Type Import Sync & Immutable Math Engine
 * @author Raz Podestá - MetaShark Tech
 */

import type { LevelDefinition, UserProgress } from './types.js';

/** 
 * CONSTANTES FÍSICAS DEL MOTOR 
 * Límite máximo de progresión dentro del sistema actual.
 */
const MAX_LEVEL = 50;

/**
 * @description Tabla de Ascensión inmutable. 
 * Generada dinámicamente con una curva de dificultad exponencial suave.
 * Fórmula: XP = 100 * (Nivel - 1) ^ 1.5
 */
export const LEVELS: ReadonlyArray<LevelDefinition> = Array.from({ length: MAX_LEVEL }, (_, i) => {
  const level = i + 1;
  const xp = level === 1 ? 0 : Math.floor(100 * Math.pow(level - 1, 1.5));
  return {
    level,
    minXp: xp,
    title: `Nivel ${level}`
  };
});

/**
 * Calcula el progreso actual de un huésped basado en su XP total acumulada.
 * Resiliente a entradas anómalas y desbordamiento de límites.
 * 
 * @param {number} totalXp - Experiencia total acumulada.
 * @returns {UserProgress} Objeto detallado con la métrica de progreso.
 */
export function calculateProgress(totalXp: number): UserProgress {
  // 1. Fallback primario: Evitar experiencia negativa
  const sanitizedXp = Math.max(0, totalXp);

  // 2. Búsqueda robusta y segura del nivel actual
  let currentLevelIdx = LEVELS.findIndex(l => l.minXp > sanitizedXp) - 1;

  // 3. Estado Zenith: Si findIndex devuelve -1 (totalXp excede el máximo nivel),
  // esto resulta en -1 - 1 = -2. Asignamos el nivel máximo absoluto.
  if (currentLevelIdx === -2) {
    currentLevelIdx = LEVELS.length - 1;
  }
  
  // 4. Fallback secundario de índice base
  if (currentLevelIdx < 0) {
    currentLevelIdx = 0;
  }

  const currentLevelDef = LEVELS[currentLevelIdx];
  const nextLevelDef = LEVELS[currentLevelIdx + 1]; // Puede ser undefined si estamos en MAX_LEVEL

  // 5. Gestión del Estado Máximo
  if (!nextLevelDef) {
    return {
      currentLevel: currentLevelDef.level,
      currentXp: sanitizedXp,
      nextLevelXp: sanitizedXp,
      progressPercent: 100
    };
  }

  // 6. Cálculo de progreso porcentual intralevel
  const xpInLevel = sanitizedXp - currentLevelDef.minXp;
  const xpRequiredForLevel = nextLevelDef.minXp - currentLevelDef.minXp;
  
  // El clamping (Math.min/max) asegura que el valor nunca salga del rango 0-100
  const progressPercent = Math.min(100, Math.max(0, (xpInLevel / xpRequiredForLevel) * 100));

  return {
    currentLevel: currentLevelDef.level,
    currentXp: sanitizedXp,
    nextLevelXp: nextLevelDef.minXp,
    progressPercent: parseFloat(progressPercent.toFixed(2))
  };
}