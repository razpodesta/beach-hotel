/**
 * @file Smoke Test para CMS Admin.
 * @description Prueba básica de renderizado.
 */
import React from 'react';
import { render, screen } from '@portfolio/testing-utils';

describe('CMS Admin: Smoke Test', () => {
  it('should verify the test environment is ready', () => {
    render(<div data-testid="smoke">CMS Admin Ready</div>);
    expect(screen.getByTestId('smoke')).toBeInTheDocument();
  });
});
