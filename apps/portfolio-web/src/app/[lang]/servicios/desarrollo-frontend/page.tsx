// RUTA: apps/portfolio-web/src/app/[lang]/servicios/desarrollo-frontend/page.tsx
// VERSIÓN: 1.1 - Higienizado y Optimizado
// @author: Raz Podestá - MetaShark Tech
// @description: Placeholder arquitectónico para la página de servicio de Desarrollo Frontend.
//               Se ha eliminado la importación no utilizada del tipo 'Locale' para cumplir
//               con la directriz de 'Higiene de Código Absoluta' y resolver las
//               advertencias del linter y el compilador de TypeScript.

import { BlurText } from '@/components/razBits/BlurText';

export default function ServicePage() {
  return (
    <main className="container mx-auto px-4 py-20 sm:py-32">
      <div className="mx-auto max-w-3xl text-center">
        <BlurText
          text="Página de Servicio"
          className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl justify-center mb-4"
        />
        <p className="font-sans text-xl text-zinc-300 mb-12">
          Contenido detallado sobre este servicio.
        </p>
        <div className="rounded-lg border border-dashed border-zinc-700 p-12">
          <p className="text-zinc-500">[ En Construcción ]</p>
        </div>
      </div>
    </main>
  );
}
