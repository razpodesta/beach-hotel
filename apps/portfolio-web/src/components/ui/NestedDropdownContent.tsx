// RUTA: apps/portfolio-web/src/components/ui/NestedDropdownContent.tsx
// VERSIÓN: 4.2 - Recursividad Tipada Final
// DESCRIPCIÓN: Implementación de menú multinivel recursivo con tipado estricto.

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import type { NavItem } from '../../lib/nav-links';
import { getLocalizedHref } from '../../lib/utils/link-helpers';
import { i18n, type Locale } from '../../config/i18n.config';

type NestedDropdownContentProps = {
  links: NavItem[] | undefined;
  dictionary: Record<string, string>;
  level?: number;
};

export function NestedDropdownContent({ links, dictionary, level = 0 }: NestedDropdownContentProps) {
  const pathname = usePathname();
  const currentLang = (pathname?.split('/')[1] as Locale) || i18n.defaultLocale;

  if (!links || links.length === 0) {
    return null;
  }

  return (
    <div className="p-2 space-y-1">
      {links.map((item: NavItem) => {
        // Tipado explícito de hijos según nuestra interfaz NavItem
        const children = item.children;
        const hasChildren = Array.isArray(children) && children.length > 0;
        const label = dictionary[item.labelKey] || item.labelKey;
        const finalHref = getLocalizedHref(item.href ?? '#', currentLang);

        if (hasChildren) {
          return (
            <div key={item.labelKey} className="relative group/submenu">
              <div className="flex items-center justify-between text-zinc-300 hover:text-white hover:bg-zinc-800 p-2 rounded-md transition-colors text-sm cursor-default">
                <div className="flex items-center gap-3">
                  {item.Icon && <item.Icon size={18} className="shrink-0" />}
                  <span>{label}</span>
                </div>
                <ChevronRight size={14} />
              </div>

              {/* Menú recursivo anidado */}
              <div className="absolute left-full top-0 -mt-2 ml-2 w-64 origin-top-left rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl shadow-black/40 z-10 opacity-0 invisible group-hover/submenu:opacity-100 group-hover/submenu:visible transition-opacity duration-200">
                <NestedDropdownContent 
                  links={children} 
                  dictionary={dictionary} 
                  level={level + 1} 
                />
              </div>
            </div>
          );
        }

        return (
          <Link
            key={item.labelKey}
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