/**
 * @file packages/testing-utils/src/lib/rendering/custom-render.tsx
 * @description Orquestador de renderizado para el Espejo de Calidad.
 *              Nivelado para cumplir con 'verbatimModuleSyntax' y React 19.
 * @version 3.0 - Sovereign Syntax Edition
 * @author Raz Podestá - MetaShark Tech
 */

import type { ReactElement, ReactNode } from 'react';
import { render as rtlRender } from '@testing-library/react';
import type { RenderOptions, RenderResult } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';

/**
 * @interface AllTheProvidersProps
 * @description Contrato de propiedades para el shell de infraestructura de pruebas.
 */
interface AllTheProvidersProps {
  children: ReactNode;
}

/**
 * Shell de Infraestructura: AllTheProviders
 * @description Emula el entorno del Master Shell (layout.tsx) inyectando 
 *              proveedores de tema y contextos necesarios para los tests de UI.
 */
const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="dark" 
      enableSystem={false} 
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
};

/**
 * Motor de Renderizado: customRender
 * @description Wrapper soberano sobre RTL que inyecta automáticamente el árbol 
 *              de proveedores del ecosistema MetaShark.
 */
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult => rtlRender(ui, { wrapper: AllTheProviders, ...options });

// Re-exportación total para mantener la API unificada del Espejo de Calidad
export * from '@testing-library/react';

// Sobrescritura soberana del método render
export { customRender as render };