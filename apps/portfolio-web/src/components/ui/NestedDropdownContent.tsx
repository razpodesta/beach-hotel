/**
 * @file apps/portfolio-web/src/components/ui/NestedDropdownContent.tsx
 * @description Orquestador recursivo para navegación multinivel (The Cascade).
 *              Refactorizado: Resolución de TS2322 mediante unificación de tipos
 *              base, erradicación de hardcoding cromático (zinc -> surface) 
 *              y cumplimiento del estándar Day-First.
 * @version 5.0 - Type Safe Recursion & Semantic Atmosphere
 * @author Staff Engineer - MetaShark Tech
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

/** IMPORTACIONES DE INFRAESTRUCTRURA */
import type { NavItem, NavLink } from '../../lib/nav-links';
import { getLocalizedHref } from '../../lib/utils/link-helpers';
import { i18n, type Locale } from '../../config/i18n.config';
import { cn } from '../../lib/utils/cn';

/**
 * CONTRATO DE RECURSIVIDAD
 * @pilar III: Seguridad de Tipos Absoluta.
 * @description Acepta tanto NavItem (padres) como NavLink (hojas finales) 
 * para permitir la propagación recursiva sin violaciones de tipo.
 */
type NestedDropdownContentProps = {
  links: (NavItem | NavLink)[] | undefined;
  dictionary: Record<string, string>;
  level?: number;
};

/**
 * APARATO PRINCIPAL: NestedDropdownContent
 * @description Renderiza una cascada de enlaces adaptativa y accesible.
 */
export function NestedDropdownContent({ links, dictionary, level = 0 }: NestedDropdownContentProps) {
  const pathname = usePathname();
  const currentLang = (pathname?.split('/')[1] as Locale) || i18n.defaultLocale;

  if (!links || links.length === 0) {
    return null;
  }

  return (
    <div className="p-1 space-y-1">
      {links.map((item) => {
        /**
         * TYPE GUARD DINÁMICO (Resolución de TS2322)
         * @description Verificamos de forma segura si la entidad posee la propiedad 'children'
         * antes de intentar acceder a ella, satisfaciendo al compilador TypeScript.
         */
        const children = 'children' in item ? item.children : undefined;
        const hasChildren = Array.isArray(children) && children.length > 0;
        
        const label = dictionary[item.labelKey] || item.labelKey;
        const finalHref = getLocalizedHref(item.href ?? '#', currentLang);

        if (hasChildren) {
          return (
            <div key={item.labelKey} className="relative group/submenu">
              {/* NODO PADRE (Trigger) */}
              <div 
                className={cn(
                  "flex items-center justify-between p-2.5 rounded-lg transition-colors text-sm cursor-default",
                  "text-muted-foreground hover:text-foreground hover:bg-surface/80"
                )}
              >
                <div className="flex items-center gap-3">
                  {item.Icon && <item.Icon size={16} className="shrink-0 opacity-70" />}
                  <span className="font-bold">{label}</span>
                </div>
                <ChevronRight size={14} className="opacity-40 group-hover/submenu:opacity-100 transition-opacity" />
              </div>

              {/* RAMA RECURSIVA (Menú Anidado) */}
              <div 
                className={cn(
                  "absolute left-full top-0 -mt-1 ml-2 w-64 origin-top-left z-10",
                  "rounded-2xl bg-surface/95 backdrop-blur-2xl border border-border shadow-3xl",
                  "opacity-0 invisible group-hover/submenu:opacity-100 group-hover/submenu:visible",
                  "transition-all duration-300 transform-gpu translate-x-2 group-hover/submenu:translate-x-0"
                )}
              >
                <NestedDropdownContent 
                  links={children} 
                  dictionary={dictionary} 
                  level={level + 1} 
                />
              </div>
            </div>
          );
        }

        {/* NODO HOJA (Enlace Final) */}
        return (
          <Link
            key={item.labelKey}
            href={finalHref}
            className={cn(
              "flex items-center gap-3 p-2.5 rounded-lg transition-colors text-sm outline-none",
              "text-muted-foreground hover:text-foreground hover:bg-surface/80",
              "focus-visible:bg-surface focus-visible:text-primary"
            )}
          >
            {item.Icon && <item.Icon size={16} className="shrink-0 opacity-70" />}
            <span className="font-bold">{label}</span>
          </Link>
        );
      })}
    </div>
  );
}