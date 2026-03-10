// RUTA: apps/portfolio-web/src/components/ui/NestedDropdownContent.tsx
// VERSIÓN: 4.0 - Soporte Recursivo de Enrutamiento Localizado
// DESCRIPCIÓN: Componente recursivo para menús multinivel que respeta el idioma activo.

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import type { NavItem, NavLink } from '../../lib/nav-links';
import { getLocalizedHref } from '../../lib/utils/link-helpers';
import { i18n, type Locale } from '../../config/i18n.config';

type NestedDropdownContentProps = {
  links: NavItem[] | undefined;
  dictionary: Record<string, string>;
  level?: number;
};

// Guarda de tipo para verificar si un item es un NavLink renderizable.
const isRenderableLink = (item: NavItem): item is NavLink => 'labelKey' in item;

export function NestedDropdownContent({ links, dictionary, level = 0 }: NestedDropdownContentProps) {
  const pathname = usePathname();
  // Extracción defensiva del idioma
  const currentLang = (pathname?.split('/')[1] as Locale) || i18n.defaultLocale;

  if (!links) {
    return null;
  }

  return (
    <div className="p-2 space-y-1">
      {links.map((item) => {
        if (!isRenderableLink(item)) {
          return null;
        }

        const hasChildren = item.children && item.children.length > 0;
        const label = dictionary[item.labelKey] || item.labelKey;

        // Calculamos la ruta localizada solo si es un enlace directo
        const finalHref = hasChildren ? '#' : getLocalizedHref(item.href, currentLang);

        if (hasChildren) {
          return (
            <div key={label} className="relative group/submenu">
              <div className="flex items-center justify-between text-zinc-300 hover:text-white hover:bg-zinc-800 p-2 rounded-md transition-colors text-sm cursor-default">
                <div className="flex items-center gap-3">
                  {item.Icon && <item.Icon size={18} className="shrink-0" />}
                  <span>{label}</span>
                </div>
                <ChevronRight size={14} />
              </div>

              <div className="absolute left-full top-0 -mt-2 ml-2 w-max origin-top-left rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl shadow-black/40 z-10 opacity-0 invisible group-hover/submenu:opacity-100 group-hover/submenu:visible transition-opacity duration-200">
                <NestedDropdownContent links={item.children} dictionary={dictionary} level={level + 1} />
              </div>
            </div>
          );
        }

        return (
          <Link
            key={label}
            href={finalHref}
            className="flex items-center gap-3 text-zinc-300 hover:text-white hover:bg-zinc-800 p-2 rounded-md transition-colors text-sm"
          >
            {item.Icon && <item.Icon size={18} className="shrink-0" />}
            <span>{label}</span>
          </Link>
        );
      })}
    </div>
  );
}
