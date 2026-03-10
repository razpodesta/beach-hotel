// RUTA: apps/portfolio-web/src/components/layout/Footer.tsx
// VERSIÓN: 5.0 - Full Semantic Theming & Zod Integration
// AUTOR: Raz Podestá - MetaShark Tech
// DESCRIPCIÓN: Pie de página principal de la aplicación.
//              Implementa diseño adaptativo (Dark/Light) utilizando tokens CSS semánticos.
//              Consume contenido estrictamente tipado desde los diccionarios de i18n.

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, type Variants } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { Dictionary } from '@/lib/schemas/dictionary.schema';
import { socialLinks } from '@/lib/social-links';
import { footerNavStructure } from '@/lib/nav-links';
import { getLocalizedHref } from '@/lib/utils/link-helpers';
import { i18n, type Locale } from '@/config/i18n.config';

/**
 * Props del Footer.
 * Utiliza tipos inferidos de Zod para garantizar la integridad de los datos.
 */
type FooterProps = {
  content: Dictionary['footer'];
  navLabels: Dictionary['nav-links']['nav_links'];
  tagline: string;
};

// Variantes de animación optimizadas para no bloquear el hilo principal
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export function Footer({ content, navLabels, tagline }: FooterProps) {
  const t = content;
  const pathname = usePathname();
  const currentLang = (pathname?.split('/')[1] as Locale) || i18n.defaultLocale;

  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
      // THEMED: Fondo y bordes semánticos
      className="border-t border-border bg-background text-muted-foreground"
    >
      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">

          {/* Columna de Branding */}
          <motion.div variants={itemVariants} className="col-span-2 md:col-span-2">
            <Link
              href={`/${currentLang}`}
              // THEMED: Texto principal adaptativo
              className="font-signature text-5xl text-foreground transition-colors hover:text-primary"
            >
              Raz Podestá
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              {tagline}
            </p>
          </motion.div>

          {/* Columnas de Navegación Dinámicas */}
          {footerNavStructure.map((column) => (
            <motion.div variants={itemVariants} key={column.columnKey}>
              <h2 className="text-sm font-semibold tracking-wider text-foreground uppercase">
                {t[column.columnKey as keyof typeof t]}
              </h2>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => {
                  const finalHref = getLocalizedHref(link.href, currentLang);

                  return (
                    <li key={link.labelKey}>
                      <Link
                        href={finalHref}
                        className="flex items-center gap-2 text-sm transition-colors hover:text-foreground hover:underline decoration-primary/50 underline-offset-4"
                      >
                        {link.Icon && (
                          <link.Icon size={14} className="shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                        )}
                        <span>{navLabels[link.labelKey as keyof typeof navLabels]}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Sección de Newsletter */}
        <motion.div variants={itemVariants} className="mt-12 border-t border-border pt-8">
          <div className="flex flex-col items-start gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">{t.newsletter_title}</h3>
              <p className="text-sm text-muted-foreground">Recibe insights y actualizaciones directamente.</p>
            </div>
            <form className="flex w-full max-w-md gap-2">
              <input
                type="email"
                placeholder={t.newsletter_placeholder}
                // THEMED: Inputs con fondo secundario y borde de input
                className="w-full rounded-md border border-input bg-secondary px-4 py-2 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                aria-label={t.newsletter_placeholder}
              />
              <button
                type="submit"
                // THEMED: Botón primario con texto invertido
                className="shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-transform hover:scale-105 hover:bg-primary/90"
                aria-label={t.newsletter_button}
              >
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </motion.div>

        {/* Copyright y Redes Sociales */}
        <motion.div variants={itemVariants} className="mt-12 flex flex-col-reverse items-center justify-between gap-6 border-t border-border pt-8 md:flex-row">
          <div className="text-center text-sm md:text-left">
            <p className="text-foreground font-medium">{t.rights_reserved}</p>
            <p className="text-muted-foreground text-xs mt-1">{t.made_by}</p>
          </div>
          <div className="flex items-center gap-4">
            {socialLinks.map(({ href, label, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visita mi perfil de ${label}`}
                // THEMED: Botones sociales circulares
                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Icon size={20} />
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
}
