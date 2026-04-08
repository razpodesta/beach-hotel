/**
 * @file engine.ts
 * @description Motor matemático soberano del Protocolo 33.
 *              Orquesta el cálculo de progresión, curvas de experiencia (XP)
 *              y niveles de ascensión para el ecosistema MetaShark.
 *              Refactorizado: Pureza matemática total, eliminación de hardcoding
 *              i18n y telemetría de progresión integrada.
 * @version 4.0 - Mathematical Purity & Observability
 * @author Raz Podestá -  MetaShark Tech
 */

import type { LevelDefinition, UserProgress } from './types.js';

/**
 * CONFIGURACIÓN DEL ALGORITMO DE ASCENSIÓN
 * @pilar_X: Performance - Constantes pre-calculadas para evitar drift.
 */
const MAX_LEVEL = 50;
const XP_BASE = 100;
const XP_EXPONENT = 1.5;

/**
 * @description Mapa inmutable de umbrales de experiencia.
 *              Se elimina la propiedad 'title' para cumplir con el Pilar VI (i18n).
 */
export const LEVELS: ReadonlyArray<Omit<LevelDefinition, 'title'>> = Object.freeze(
  Array.from({ length: MAX_LEVEL }, (_, i) => {
    const level = i + 1;
    // Fórmula de crecimiento parabólico: XP = Base * (Lvl-1)^Exp
    const minXp = level === 1 ? 0 : Math.floor(XP_BASE * Math.pow(level - 1, XP_EXPONENT));
    return {
      level,
      minXp
    };
  })
);

/**
 * MODULE: calculateProgress
 * @description Transmuta un valor bruto de XP en un contrato de progreso detallado.
 * @param {number} totalXp - Puntos de experiencia acumulados.
 * @returns {UserProgress} Objeto de progreso validado y normalizado.
 * @pilar_IV: Observabilidad - Implementa trazas forenses de nivelación.
 */
export function calculateProgress(totalXp: number): UserProgress {
  const sanitizedXp = Math.max(0, totalXp);
  
  /**
   * RESOLUCIÓN DE NIVEL (Búsqueda Determinista)
   * Buscamos el nivel más alto cuyo umbral sea menor o igual a la XP actual.
   */
  const currentLevelIdx = [...LEVELS].reverse().findIndex(l => sanitizedXp >= l.minXp);
  // Revertimos el índice del array invertido para obtener la posición real
  const actualIdx = currentLevelIdx === -1 ? 0 : (LEVELS.length - 1 - currentLevelIdx);

  const currentLevelDef = LEVELS[actualIdx];
  const nextLevelDef = LEVELS[actualIdx + 1];

  // --- CASO: RANGO MÁXIMO ALCANZADO (CAP) ---
  if (!nextLevelDef) {
    return {
      currentLevel: currentLevelDef.level,
      currentXp: sanitizedXp,
      nextLevelXp: sanitizedXp,
      progressPercent: 100
    };
  }

  // --- CÁLCULO DE MÉTRICAS INTER-NIVEL ---
  const xpRequiredForCurrent = currentLevelDef.minXp;
  const xpRequiredForNext = nextLevelDef.minXp;
  
  const xpProgressInLevel = sanitizedXp - xpRequiredForCurrent;
  const totalXpInLevelGap = xpRequiredForNext - xpRequiredForCurrent;
  
  /**
   * @pilar_X: Precisión Matemática.
   * Garantizamos un porcentaje con 2 decimales para micro-animaciones fluidas en el HUD.
   */
  const rawPercent = (xpProgressInLevel / totalXpInLevelGap) * 100;
  const progressPercent = parseFloat(Math.min(100, Math.max(0, rawPercent)).toFixed(2));

  // Telemetría de Progresión (Trace Sampling para niveles altos)
  if (currentLevelDef.level >= 33) {
    console.log(`[HEIMDALL][P33] High-Value progression detected. Level: ${currentLevelDef.level} | XP: ${sanitizedXp}`);
  }

  return {
    currentLevel: currentLevelDef.level,
    currentXp: sanitizedXp,
    nextLevelXp: nextLevelDef.minXp,
    progressPercent
  };
}