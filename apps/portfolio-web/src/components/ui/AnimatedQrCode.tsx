/**
 * @file Componente de Código QR Animado.
 * @description Envuelve el componente base QrCode para añadir una animación cíclica de
 *              colores, creando un efecto de "luz de navidad".
 * @version 1.0
 * @author Raz Podestá
 */
'use client';

import { useState, useEffect } from 'react';
import { QrCode } from './QrCode';

type AnimatedQrCodeProps = {
  /** La URL a codificar en el QR. */
  url: string;
  /** El tamaño del QR en píxeles. */
  size?: number;
  /** El texto alternativo para la imagen del QR (importante para accesibilidad). */
  alt: string;
  className?: string;
};

// Paleta de colores curada que se alinea con el branding del portafolio.
const colorPalette = [
  '6d28d9', // Violeta Intenso
  'be185d', // Fucsia
  'db2777', // Rosa Intenso
  '9333ea', // Púrpura
];

/**
 * Renderiza un código QR que cambia de color de forma cíclica.
 * @param {AnimatedQrCodeProps} props - Las propiedades del componente.
 * @returns {JSX.Element} Un componente QrCode con colores dinámicos.
 */
export function AnimatedQrCode({ url, size, alt, className }: AnimatedQrCodeProps) {
  const [colorIndex, setColorIndex] = useState(0);

  useEffect(() => {
    // Se establece un intervalo para cambiar el color cada 1.5 segundos.
    const intervalId = setInterval(() => {
      setColorIndex(prevIndex => (prevIndex + 1) % colorPalette.length);
    }, 1500);

    // Función de limpieza: se detiene el intervalo cuando el componente se desmonta.
    return () => clearInterval(intervalId);
  }, []); // El array vacío asegura que el efecto se ejecute solo una vez.

  return (
    <QrCode
      url={url}
      size={size}
      alt={alt}
      className={className}
      color={colorPalette[colorIndex]}
      bgColor="FFFFFF" // Mantenemos el fondo blanco para máxima legibilidad.
    />
  );
}
