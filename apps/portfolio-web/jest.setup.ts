/**
 * @file apps/portfolio-web/jest.setup.ts
 * @description Configuración del entorno de pruebas JSDOM. 
 *              Implementa polyfills de infraestructura y mocks de APIs del navegador.
 * @version 3.0 - Elite Test Environment
 */

import { TextEncoder, TextDecoder } from 'util';
import { TransformStream, ReadableStream } from 'node:stream/web';
import 'isomorphic-fetch';
import '@testing-library/jest-dom';

/**
 * @pilar VIII (Resiliencia): Inyección de Polyfills Globales.
 * Necesario para compatibilidad con librerías que consumen streams y encoding en JSDOM.
 */
Object.assign(global, {
  TextEncoder,
  TextDecoder,
  TransformStream,
  ReadableStream,
});

/**
 * MOCK: window.matchMedia
 * Requerido para pruebas de UI con lógica responsiva.
 */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

/**
 * MOCK: IntersectionObserver
 * @pilar XII: UX - Esencial para componentes con animaciones on-scroll.
 */
class IntersectionObserverMock {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  disconnect = jest.fn();
  observe = jest.fn();
  takeRecords = jest.fn(() => []);
  unobserve = jest.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserverMock,
});

global.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver;