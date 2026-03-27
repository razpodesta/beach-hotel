/**
 * @file packages/protocol-33/src/lib/engine.ts
 * @description Motor matemático del Protocolo 33. 
 *              Refactorizado para eliminar extensiones .js en origen.
 * @version 3.0 - Clean Resolution Standard
 */

import type { LevelDefinition, UserProgress } from './types';

const MAX_LEVEL = 50;

export const LEVELS: ReadonlyArray<LevelDefinition> = Array.from({ length: MAX_LEVEL }, (_, i) => {
  const level = i + 1;
  const xp = level === 1 ? 0 : Math.floor(100 * Math.pow(level - 1, 1.5));
  return {
    level,
    minXp: xp,
    title: `Nivel ${level}`
  };
});

export function calculateProgress(totalXp: number): UserProgress {
  const sanitizedXp = Math.max(0, totalXp);
  let currentLevelIdx = LEVELS.findIndex(l => l.minXp > sanitizedXp) - 1;

  if (currentLevelIdx === -2) {
    currentLevelIdx = LEVELS.length - 1;
  }
  
  if (currentLevelIdx < 0) {
    currentLevelIdx = 0;
  }

  const currentLevelDef = LEVELS[currentLevelIdx];
  const nextLevelDef = LEVELS[currentLevelIdx + 1];

  if (!nextLevelDef) {
    return {
      currentLevel: currentLevelDef.level,
      currentXp: sanitizedXp,
      nextLevelXp: sanitizedXp,
      progressPercent: 100
    };
  }

  const xpInLevel = sanitizedXp - currentLevelDef.minXp;
  const xpRequiredForLevel = nextLevelDef.minXp - currentLevelDef.minXp;
  const progressPercent = Math.min(100, Math.max(0, (xpInLevel / xpRequiredForLevel) * 100));

  return {
    currentLevel: currentLevelDef.level,
    currentXp: sanitizedXp,
    nextLevelXp: nextLevelDef.minXp,
    progressPercent: parseFloat(progressPercent.toFixed(2))
  };
}