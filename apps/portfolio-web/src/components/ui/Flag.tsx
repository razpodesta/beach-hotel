// RUTA: apps/portfolio-web/src/components/ui/Flag.tsx

/**
 * @file Componente de Bandera Soberano y de Alto Rendimiento.
 * @version 2.0 - Optimización CDN & Style Merge
 * @description Renderiza una bandera SVG desde flagcdn.com. 
 *              Utiliza `unoptimized` para evitar el procesamiento innecesario de Next.js,
 *              maximizando la velocidad de entrega al cliente.
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import Image from 'next/image';
import { cn } from '../../lib/utils/cn';

export interface FlagProps {
  /** El código de país ISO 3166-1 alpha-2 (ej. 'US', 'BR', 'ES'). */
  countryCode: string;
  /** Clases de Tailwind CSS para aplicar estilos personalizados. */
  className?: string;
}

/**
 * Muestra la bandera de un país utilizando flagcdn para entrega óptima.
 * 
 * @param {FlagProps} props - Propiedades del componente.
 * @returns {JSX.Element} Un elemento de bandera optimizado.
 */
export function Flag({ countryCode, className }: FlagProps) {
  const code = countryCode.toLowerCase();
  const flagUrl = `https://flagcdn.com/${code}.svg`;

  return (
    <div className={cn('relative overflow-hidden rounded-sm', className)}>
      <Image
        src={flagUrl}
        alt={`Bandera de ${countryCode.toUpperCase()}`}
        fill
        sizes="(max-width: 768px) 24px, 32px"
        // 'unoptimized' es fundamental aquí: el CDN ya entrega un SVG optimizado.
        // Esto evita que Next.js intente procesarlo innecesariamente.
        unoptimized
        className="object-cover"
      />
    </div>
  );
}