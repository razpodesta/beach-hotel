/**
 * @file apps/portfolio-web/jest.setup.ts
 * @description Configuración de Infraestructura para el Espejo de Calidad (JSDOM).
 *              Refactorizado: Resolución de TS2694 mediante abstracción funcional 
 *              de tipos para el motor de mocks.
 *              Higiene: Erradicación de advertencias de ESLint por variables no usadas
 *              en los mocks del DOM.
 * @version 3.4 - Pure Infrastructure & Linter Compliant
 * @author Staff Engineer - MetaShark Tech
 */

import { TextEncoder, TextDecoder } from 'util';
import { TransformStream, ReadableStream } from 'node:stream/web';
import 'isomorphic-fetch';
import '@testing-library/jest-dom';

/**
 * 1. PROYECCIÓN DE TIPOS SOBERANA (Anti-Shadowing)
 * @pilar III: Seguridad de Tipos Absoluta.
 * Definimos la firma del motor de mocks sin depender del namespace global
 * para evitar colisiones durante el análisis del grafo de Nx.
 */
interface GlobalJest {
  fn: <T extends (...args: never[]) => unknown>(implementation?: T) => {
    mockImplementation: (fn: T) => unknown;
  } & T;
}

/** 
 * @constant jestEngine
 * Acceso seguro al motor de espionaje inyectado por Jest.
 */
const jestEngine = (globalThis as unknown as { jest: GlobalJest }).jest;

/**
 * 2. INFRAESTRUCTRURA DE COMUNICACIONES (Silo C Ready)
 * @pilar VIII: Resiliencia de Infraestructura.
 */
Object.assign(globalThis, {
  TextEncoder,
  TextDecoder,
  TransformStream,
  ReadableStream,
});

/**
 * 3. MOCK: window.matchMedia
 * @description Validación de atmósfera y respuesta responsiva.
 */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jestEngine.fn().mockImplementation((_query: string) => ({
    matches: false,
    media: _query,
    onchange: null,
    addListener: () => { /* No-op */ },
    removeListener: () => { /* No-op */ },
    addEventListener: () => { /* No-op */ },
    removeEventListener: () => { /* No-op */ },
    dispatchEvent: () => true,
  })),
});

/**
 * 4. MOCK: IntersectionObserver (MEA/UX Architecture)
 * @pilar XII: UX - Implementación completa para animaciones on-scroll.
 * @fix: Se eliminan nombres de parámetros no usados para satisfacer al linter.
 */
class IntersectionObserverMock implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  readonly scrollMargin: string = '';

  disconnect(): void {
    // Protocolo de limpieza
  }

  observe(_target: Element): void {
    // Registro de nodo. El guion bajo indica al linter que es un parámetro de firma.
    void _target;
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  unobserve(_target: Element): void {
    // Cese de observación.
    void _target;
  }
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserverMock,
});

/**
 * @description Sello de Identidad Global.
 */
(globalThis as unknown as { IntersectionObserver: typeof IntersectionObserverMock }).IntersectionObserver = IntersectionObserverMock;