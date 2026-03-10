import { TextEncoder, TextDecoder } from 'util';
// Importamos las implementaciones nativas de Streams de Node.js
import { TransformStream, ReadableStream } from 'node:stream/web';
import 'isomorphic-fetch';

// 1. Polyfill para TextEncoder/Decoder (Requerido por MSW)
// @ts-expect-error: Compatibilidad de tipos Node vs DOM
global.TextEncoder = TextEncoder;
// @ts-expect-error: Compatibilidad de tipos Node vs DOM
global.TextDecoder = TextDecoder;

// 2. Polyfill para Web Streams API (CRÍTICO PARA MSW 2.x + JSDOM)
// Esto soluciona "ReferenceError: TransformStream is not defined"
// @ts-expect-error: Compatibilidad de tipos Node vs DOM
global.TransformStream = TransformStream;
// @ts-expect-error: Compatibilidad de tipos Node vs DOM
global.ReadableStream = ReadableStream;

// 3. Verificación de Globals (Opcional)
if (!global.fetch) {
  console.warn('⚠️ [jest.setup.ts] Global fetch failed to initialize.');
}
