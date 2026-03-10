// RUTA: packages/protocol-33/src/lib/codex.ts
// VERSIÓN: 1.1 - ESM Import Fix
// DESCRIPCIÓN: Corrección de importación para NodeNext (.js explícito).

import { ArtifactDefinition } from './types.js'; // <-- CORRECCIÓN AQUÍ

export const ARTIFACTS: ReadonlyArray<ArtifactDefinition> = [
  // --- CASA I: LOS ARQUITECTOS ---
  {
    id: 'monolito-obsidiana',
    name: 'El Monolito de Obsidiana',
    description: 'La base de datos inmutable. Donde todo comienza.',
    house: 'ARCHITECTS',
    rarity: 'COMMON',
    baseValue: 10
  },
  {
    id: 'martillo-thorvalds',
    name: 'El Martillo de Thorvalds',
    description: 'Para compilar kernels y forjar acero digital.',
    house: 'ARCHITECTS',
    rarity: 'COMMON',
    baseValue: 15
  },
  {
    id: 'escudo-firewall',
    name: 'El Escudo Firewall',
    description: 'Nada pasa sin el handshake correcto.',
    house: 'ARCHITECTS',
    rarity: 'RARE',
    baseValue: 50
  },
  {
    id: 'llave-maestra-ssh',
    name: 'La Llave Maestra (SSH)',
    description: 'Acceso root concedido al portador.',
    house: 'ARCHITECTS',
    rarity: 'RARE',
    baseValue: 75
  },

  // --- CASA II: LAS TEJEDORAS ---
  {
    id: 'pluma-pixeles',
    name: 'La Pluma de Píxeles',
    description: 'Escribe el código que el ojo humano ama.',
    house: 'WEAVERS',
    rarity: 'COMMON',
    baseValue: 10
  },
  {
    id: 'mascara-musa',
    name: 'La Máscara de la Musa',
    description: 'La identidad de marca que cautiva al usuario.',
    house: 'WEAVERS',
    rarity: 'LEGENDARY',
    baseValue: 500
  },

  // --- CASA III: LOS ANOMALÍA ---
  {
    id: 'pato-goma-dorado',
    name: 'El Pato de Goma Dorado',
    description: 'El consejero silencioso que resuelve todos los bugs.',
    house: 'ANOMALIES',
    rarity: 'COMMON',
    baseValue: 20
  },
  {
    id: 'terminal-fantasma',
    name: 'La Terminal Fantasma',
    description: 'Donde los magos lanzan sus hechizos.',
    house: 'ANOMALIES',
    rarity: 'MYTHIC',
    baseValue: 1000
  },
  {
    id: 'entidad-ia',
    name: 'La Entidad IA',
    description: 'La inteligencia que aprendió a crear.',
    house: 'ANOMALIES',
    rarity: 'UNIQUE',
    baseValue: 9999,
    maxSupply: 1
  }
] as const;

export type ArtifactId = typeof ARTIFACTS[number]['id'];

export function getArtifactById(id: string): ArtifactDefinition | undefined {
  return ARTIFACTS.find(a => a.id === id);
}
