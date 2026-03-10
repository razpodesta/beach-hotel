// RUTA: /packages/testing-utils/src/lib/rendering/custom-render.tsx
// VERSIÓN: 2.1 - Higienizado
// DESCRIPCIÓN: Se elimina la importación no utilizada de 'MockI18nProvider'
//              para resolver el error de build TS6133.

import React, { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';

// El componente 'AllTheProviders' que envuelve a nuestros componentes.
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      {children}
    </ThemeProvider>
  );
};

// La función 'customRender' que exportaremos y usaremos en las pruebas.
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult => render(ui, { wrapper: AllTheProviders, ...options });

// Re-exportamos todo desde @testing-library/react para tener un único punto de importación.
export * from '@testing-library/react';
// Sobrescribimos el 'render' original con el nuestro.
export { customRender as render };
