/**
 * @file Configuración del Entorno de Pruebas (Setup).
 * @description Inyecta polyfills globales y matchers de Jest-DOM.
 * @version 1.2.0 - Matchers Extendidos
 * @author Raz Podestá - MetaShark Tech
 */

import { TextEncoder, TextDecoder } from 'util';
import { TransformStream, ReadableStream } from 'node:stream/web';
import 'isomorphic-fetch';
// IMPORTANTE: Extiende expect(...) con validaciones de DOM
import '@testing-library/jest-dom';

// 1. Polyfill para TextEncoder/Decoder
// @ts-expect-error: Compatibilidad de tipos Node vs DOM
global.TextEncoder = TextEncoder;
// @ts-expect-error: Compatibilidad de tipos Node vs DOM
global.TextDecoder = TextDecoder;

// 2. Polyfill para Web Streams API
// @ts-expect-error: Compatibilidad de tipos Node vs DOM
global.TransformStream = TransformStream;
// @ts-expect-error: Compatibilidad de tipos Node vs DOM
global.ReadableStream = ReadableStream;

// 3. Polyfill para window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// 4. Verificación de Globals
if (!global.fetch) {
  console.warn('⚠️ [jest.setup.ts] Global fetch failed to initialize.');
}
