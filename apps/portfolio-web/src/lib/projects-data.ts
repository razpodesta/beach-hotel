// RUTA: apps/portfolio-web/src/lib/projects-data.ts
// VERSIÓN: 3.0 - Sincronizado con Repositorios Reales de GitHub.
// DESCRIPCIÓN: Fuente de verdad definitiva para los proyectos del portafolio.
//              Las descripciones han sido curadas a partir de los READMEs de cada
//              repositorio para reflejar con precisión su propósito y tecnología.

import type { Project } from './types';

// Función auxiliar para construir objetos de proyecto de forma consistente.
const buildProject = (repoName: string, tags: string[], description: string, liveUrl?: string): Project => ({
  id: repoName,
  title: repoName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
  description: description,
  imageUrl: `/projects/${repoName}.jpg`, // ATENCIÓN: Debes crear estas imágenes.
  codeUrl: `https://github.com/razpodesta/${repoName}`,
  liveUrl: liveUrl || '#', // URL de la demo en vivo.
  tags: tags,
});

export const projectsData: Project[] = [
  buildProject(
    'oh-hostels',
    ['Next.js', 'TypeScript', 'i18n', 'Tailwind CSS', 'Zod'],
    'Plataforma web de élite para una cadena hotelera, con sistema de reservas, internacionalización y optimización SEO avanzada.'
  ),
  buildProject(
    'dfs-invest-suite',
    ['React', 'Fintech', 'TypeScript', 'Data Visualization'],
    'Suite de herramientas para análisis de inversiones financieras, con visualizaciones de datos complejas y en tiempo real para la toma de decisiones.'
  ),
  buildProject(
    'project-health-analyzer',
    ['Nx Monorepo', 'TypeScript', 'Node.js', 'AST'],
    'Herramienta de análisis estático de código para monorepos, diseñada para detectar problemas de arquitectura y salud del proyecto.'
  ),
   buildProject(
    'openlia',
    ['AI', 'Node.js', 'TypeScript', 'API'],
    'Núcleo de un asistente de inteligencia artificial soberano, diseñado para acelerar y asistir en el ciclo de vida del desarrollo de software.'
  ),
  buildProject(
    'metashark-website',
    ['Next.js', 'Framer Motion', 'Tailwind CSS', 'Storytelling'],
    'Sitio web corporativo con un fuerte enfoque en la narrativa de marca y animaciones fluidas para una experiencia de usuario inmersiva.'
  ),
  buildProject(
    'vinyTravel',
    ['React', 'Node.js', 'API Integration', 'Mobile First'],
    'Aplicación para la planificación de viajes, que integra múltiples APIs para ofrecer una experiencia de usuario fluida y completa.'
  ),
  buildProject(
    'lawyers-landing',
    ['Next.js', 'Landing Page', 'Lead Generation', 'SEO'],
    'Landing page de alta conversión para un estudio de abogados, optimizada para la captación de clientes potenciales y con un fuerte enfoque en SEO local.'
  ),
  buildProject(
    'hiperdrive-razwrite',
    ['AI', 'Content Generation', 'Next.js', 'API'],
    'Herramienta de generación de contenido asistida por IA, diseñada para crear artículos y copys optimizados para marketing y SEO.'
  ),
  buildProject(
    'masculinerevolution',
    ['Community', 'Next.js', 'Membership', 'Content Platform'],
    'Plataforma de contenido y comunidad online con sistema de membresías, diseñada para fomentar la interacción y el acceso a contenido exclusivo.'
  ),
   buildProject(
    'funeraria-virtual',
    ['Next.js', 'E-commerce', 'Service Platform', 'UX/UI'],
    'Plataforma de servicios funerarios online, con un diseño empático y una interfaz de usuario clara para facilitar procesos en momentos difíciles.'
  ),
  buildProject(
    'cogniread',
    ['AI', 'EdTech', 'TypeScript', 'API'],
    'Aplicación de tecnología educativa (EdTech) que utiliza IA para mejorar la comprensión lectora y la retención de información.'
  ),
  buildProject(
    'rumo-certo-portal',
    ['Next.js', 'Portal', 'i18n', 'Content Hub'],
    'Portal de contenidos multilingüe, diseñado como un centro de información centralizado con una arquitectura escalable para un alto volumen de tráfico.'
  )
];
