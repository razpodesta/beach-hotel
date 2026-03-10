// RUTA: apps/portfolio-web/src/lib/social-links.ts
// VERSIÓN: 1.0 - Fuente de verdad para redes sociales

import { Github, Linkedin, Twitter, Instagram, PenTool, Figma } from 'lucide-react';

export const socialLinks = [
  {
    label: 'GitHub',
    href: 'https://github.com/razpodesta',
    icon: Github,
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/razpodesta',
    icon: Linkedin,
  },
  {
    label: 'X (Twitter)',
    href: 'https://x.com/razpodesta',
    icon: Twitter,
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com/razpodesta',
    icon: Instagram,
  },
  // NOTA: Behance no tiene un ícono directo en Lucide, usamos PenTool como alternativa.
  {
    label: 'Behance',
    href: 'https://behance.net/razpodesta',
    icon: PenTool,
  },
  {
    label: 'Figma',
    href: 'https://figma.com/@razpodesta',
    icon: Figma,
  },
];
