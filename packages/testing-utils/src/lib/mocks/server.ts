// RUTA: /packages/testing-utils/src/lib/mocks/server.ts
// VERSIÓN: 1.1 - Compatible con Módulos ESM
// DESCRIPCIÓN: Se añade la extensión '.js' a la importación para cumplir
//              con la regla de resolución de módulos 'nodenext'.

import { setupServer } from 'msw/node';
// --- INICIO DE LA CORRECCIÓN ARQUITECTÓNICA ---
import { handlers } from './handlers.js';

// Configura y exporta el servidor de mocking con nuestros handlers.
export const server = setupServer(...handlers);
