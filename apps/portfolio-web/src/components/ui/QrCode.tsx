// RUTA: apps/portfolio-web/src/components/ui/QrCode.tsx

/**
 * @file Generador de Código QR Soberano
 * @version 3.0 - Local Engine (Cero Dependencias Externas)
 * @description Genera códigos QR localmente usando el motor 'qrcode'.
 *              Elimina dependencias de APIs externas, mejorando privacidad y rendimiento.
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import { useMemo } from 'react';
import QRCode from 'qrcode';
import { cn } from '../../lib/utils/cn';

export interface QrCodeProps {
  /** La URL a codificar en el QR. */
  url: string;
  /** Tamaño del QR en píxeles. */
  size?: number;
  /** Texto alternativo para accesibilidad. */
  alt: string;
  /** Color de los módulos (Hex con o sin #). */
  color?: string;
  /** Color de fondo (Hex con o sin #). */
  bgColor?: string;
  className?: string;
}

/**
 * Renderiza un código QR nativo en SVG, local y ultra-rápido.
 */
export function QrCode({ 
  url, 
  size = 128, 
  alt, 
  color = '#000000', 
  bgColor = '#ffffff', 
  className 
}: QrCodeProps) {
  
  // Generación memoizada del SVG para evitar recálculos en cada render.
  const svgData = useMemo(() => {
    // Limpiamos los colores para asegurar formato hexadecimal
    const fg = color.startsWith('#') ? color : `#${color}`;
    const bg = bgColor.startsWith('#') ? bgColor : `#${bgColor}`;

    return QRCode.toString(url, {
      type: 'svg',
      width: size,
      margin: 1,
      color: { dark: fg, light: bg }
    });
  }, [url, size, color, bgColor]);

  return (
    <div 
      className={cn('inline-block overflow-hidden', className)}
      style={{ width: size, height: size }}
      aria-label={alt}
      dangerouslySetInnerHTML={{ __html: svgData }}
    />
  );
}