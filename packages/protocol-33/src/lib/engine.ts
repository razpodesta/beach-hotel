// RUTA: packages/protocol-33/src/lib/engine.ts
// VERSIÓN: 1.1 - ESM Import Fix
// DESCRIPCIÓN: Corrección de importación para NodeNext (.js explícito).

import { LevelDefinition, UserProgress } from './types.js'; // <-- CORRECCIÓN AQUÍ

// Fórmula de XP: Nivel 1 = 0xp, Nivel 2 = 100xp, Nivel 3 = 250xp... (Curva exponencial suave)
// XP = 100 * (level - 1) ^ 1.5
const MAX_LEVEL = 50;

export const LEVELS: LevelDefinition[] = Array.from({ length: MAX_LEVEL }, (_, i) => {
  const level = i + 1;
  const xp = level === 1 ? 0 : Math.floor(100 * Math.pow(level - 1, 1.5));
  return {
    level,
    minXp: xp,
    title: `Nivel ${level}`
  };
});

/**
 * Calcula el progreso de un usuario basado en su XP total.
 * @param totalXp Experiencia total acumulada.
 */
export function calculateProgress(totalXp: number): UserProgress {
  let currentLevelIdx = LEVELS.findIndex(l => l.minXp > totalXp) - 1;

  if (currentLevelIdx === -2) currentLevelIdx = LEVELS.length - 1;
  if (currentLevelIdx < 0) currentLevelIdx = 0;

  const currentLevelDef = LEVELS[currentLevelIdx];
  const nextLevelDef = LEVELS[currentLevelIdx + 1];

  if (!nextLevelDef) {
    return {
      currentLevel: currentLevelDef.level,
      currentXp: totalXp,
      nextLevelXp: totalXp,
      progressPercent: 100
    };
  }

  const xpInLevel = totalXp - currentLevelDef.minXp;
  const xpRequiredForLevel = nextLevelDef.minXp - currentLevelDef.minXp;
  const progressPercent = Math.min(100, Math.max(0, (xpInLevel / xpRequiredForLevel) * 100));

  return {
    currentLevel: currentLevelDef.level,
    currentXp: totalXp,
    nextLevelXp: nextLevelDef.minXp,
    progressPercent: parseFloat(progressPercent.toFixed(2))
  };
}
