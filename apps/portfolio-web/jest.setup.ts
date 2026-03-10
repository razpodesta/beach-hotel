import { TextEncoder, TextDecoder } from 'util';
import { TransformStream, ReadableStream } from 'node:stream/web';
import 'isomorphic-fetch';
import '@testing-library/jest-dom';

// --- POLYFILLS (Node vs JSDOM types) ---
/* eslint-disable @typescript-eslint/no-explicit-any */
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;
global.TransformStream = TransformStream as any;
global.ReadableStream = ReadableStream as any;
/* eslint-enable @typescript-eslint/no-explicit-any */

// --- MOCK WINDOW.MATCHMEDIA ---
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    /* eslint-disable @typescript-eslint/no-empty-function */
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    /* eslint-enable @typescript-eslint/no-empty-function */
    dispatchEvent: () => false,
  }),
});

// --- MOCK INTERSECTION OBSERVER ---
class IntersectionObserverMock {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];

  /* eslint-disable @typescript-eslint/no-empty-function */
  disconnect() {}
  observe() {}
  takeRecords(): IntersectionObserverEntry[] { return []; }
  unobserve() {}
  /* eslint-enable @typescript-eslint/no-empty-function */
}

/* eslint-disable @typescript-eslint/no-explicit-any */
global.IntersectionObserver = IntersectionObserverMock as any;
window.IntersectionObserver = IntersectionObserverMock as any;
/* eslint-enable @typescript-eslint/no-explicit-any */
