// RUTA: packages/protocol-33/src/lib/types.ts
// VERSIÓN: 1.0 - Tipos Nucleares
// DESCRIPCIÓN: Definiciones de tipos para el sistema de gamificación.

export type House = 'ARCHITECTS' | 'WEAVERS' | 'ANOMALIES';
export type Rarity = 'COMMON' | 'RARE' | 'LEGENDARY' | 'MYTHIC' | 'UNIQUE';

export interface ArtifactDefinition {
  id: string;
  name: string; // Clave de i18n o nombre base
  description: string; // Clave de i18n o descripción base
  house: House;
  rarity: Rarity;
  baseValue: number; // Valor en RazTokens (RZB)
  maxSupply?: number; // null = infinito
}

export interface LevelDefinition {
  level: number;
  minXp: number;
  title: string; // Título del rango (ej: "Iniciado", "Tecnomante")
}

export interface UserProgress {
  currentLevel: number;
  currentXp: number;
  nextLevelXp: number;
  progressPercent: number;
}
