/**
 * @file tests/verify-resolution.spec.tsx
 * @description Prueba de arquitectura para verificar que los alias y el CMS Core se resuelven correctamente.
 */

import { render, screen } from '@portfolio/testing-utils';
import React from 'react';
// Prueba de resolución del alias de la aplicación
import { BlurText } from '@/components/razBits/BlurText';
// Prueba de resolución del paquete core (CMS)
import { Projects } from '@metashark/cms-core/collections'; 

describe('Arquitectura: Verificación de Mapeo de Módulos', () => {
  it('debe resolver el alias @/ de la aplicación', () => {
    render(<BlurText text="Integración" />);
    expect(screen.getByText(/Integración/i)).toBeInTheDocument();
  });

  it('debe resolver el módulo del CMS Core', () => {
    // Si esta línea no lanza error, TypeScript y Jest resuelven la librería interna
    expect(Projects).toBeDefined();
    expect(Projects.slug).toBe('projects');
  });
});