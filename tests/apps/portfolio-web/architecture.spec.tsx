// RUTA: tests/apps/portfolio-web/architecture.spec.tsx
import React from 'react';
import { screen } from '@testing-library/react';
// IMPORTANTE: Usamos el 'customRender' centralizado del monorepo
import { render } from '@portfolio/testing-utils';

// EXCEPCIÓN ARQUITECTÓNICA:
// La carpeta 'tests/' reside físicamente fuera de la app para mantener la pureza del src.
// Por lo tanto, debemos importar los componentes de la app explícitamente.
// Nx marca esto como error de frontera, pero en el contexto de "Mirror Testing" es correcto.
// eslint-disable-next-line @nx/enforce-module-boundaries
import { BlurText } from '@/components/razBits/BlurText';

describe('Architecture Integrity: Portfolio Web', () => {
  it('should resolve local aliases and render React components in JSDOM', () => {
    // 1. Renderizamos un componente complejo que usa framer-motion
    render(<BlurText text="Architecture Test" />);

    // 2. Verificamos que está en el documento.
    // NOTA: BlurText divide el texto en spans separados ("Architecture" y "Test").
    // Buscamos solo la primera parte para evitar errores de texto fragmentado.
    const element = screen.getByText(/Architecture/i);
    expect(element).toBeInTheDocument();
  });

  it('should have access to the window object (JSDOM environment)', () => {
    expect(window).toBeDefined();
    expect(document).toBeDefined();
  });
});
