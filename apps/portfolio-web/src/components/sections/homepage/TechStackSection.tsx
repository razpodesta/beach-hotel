/**
 * @file Sección del Stack Tecnológico con Carruseles Duales.
 * @description Muestra las tecnologías clave en dos carruseles infinitos y opuestos.
 *              Esta versión restaura la lista completa de iconos, corrige errores críticos de
 *              tipado y cumple con todas las directrices de la arquitectura de élite.
 * @version 5.0
 * @author Raz Podestá
 * @adherenceCumple con todas las directrices del manifiesto, incluyendo la corrección
 *            de errores críticos, restauración de contenido, optimización, documentación y entrega atómica.
 */
'use client';

import { useRef } from 'react';
import type { ComponentType, SVGProps } from 'react';
import {
    // Frontend & Diseño
    SiReact, SiNextdotjs, SiTailwindcss, SiSvelte, SiTypescript, SiJavascript,
    SiHtml5, SiVite, SiVuedotjs, SiAngular, SiFramer,
    SiRedux, SiWebpack, SiEslint, SiPrettier, SiJest, SiFigma,
    // Backend, DevOps, IA & Automatización
    SiNodedotjs, SiNestjs, SiPython, SiGo, SiGraphql, SiPostgresql,
    SiMongodb, SiRedis, SiSupabase, SiFirebase, SiVercel, SiNetlify, SiGit,
    SiGithub, SiPnpm, SiOpenai, SiHuggingface, SiTensorflow, SiPytorch,
    SiN8n, SiZapier,
    // E-commerce & Marketing
    SiShopify, SiWoocommerce, SiGoogleads, SiMeta, SiTiktok, SiSpotify,
    SiGoogleanalytics, SiMailchimp
} from '@icons-pack/react-simple-icons';
import { BlurText } from '../../razBits/BlurText';
import { useInfiniteCarouselAnimation } from '../../../lib/hooks/use-infinite-carousel-animation';
import type { Dictionary } from '../../../lib/schemas/dictionary.schema';

// ===================================================================================
// ARQUITECTURA DE DATOS: TIPOS Y LISTAS DE TECNOLOGÍAS
// ===================================================================================

/**
 * @type {object} TechInfo
 * @description Define la estructura de un objeto de tecnología para los carruseles.
 */
type TechInfo = {
  name: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  url: string;
};

// Lista completa de tecnologías de Frontend, Diseño, E-commerce y Marketing
const frontendAndCreative: TechInfo[] = [
  { name: 'React', icon: SiReact, url: 'https://react.dev/' },
  { name: 'Next.js', icon: SiNextdotjs, url: 'https://nextjs.org/' },
  { name: 'Tailwind CSS', icon: SiTailwindcss, url: 'https://tailwindcss.com/' },
  { name: 'Svelte', icon: SiSvelte, url: 'https://svelte.dev/' },
  { name: 'TypeScript', icon: SiTypescript, url: 'https://www.typescriptlang.org/' },
  { name: 'JavaScript', icon: SiJavascript, url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
  { name: 'HTML5', icon: SiHtml5, url: 'https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5' },
  { name: 'Vite', icon: SiVite, url: 'https://vitejs.dev/' },
  { name: 'Vue.js', icon: SiVuedotjs, url: 'https://vuejs.org/' },
  { name: 'Angular', icon: SiAngular, url: 'https://angular.io/' },
  { name: 'Framer Motion', icon: SiFramer, url: 'https://www.framer.com/motion/' },
  { name: 'Redux', icon: SiRedux, url: 'https://redux.js.org/' },
  { name: 'Figma', icon: SiFigma, url: 'https://www.figma.com/' },
  { name: 'Jest', icon: SiJest, url: 'https://jestjs.io/' },
  { name: 'ESLint', icon: SiEslint, url: 'https://eslint.org/' },
  { name: 'Prettier', icon: SiPrettier, url: 'https://prettier.io/' },
  { name: 'Webpack', icon: SiWebpack, url: 'https://webpack.js.org/' },
  { name: 'Shopify', icon: SiShopify, url: 'https://www.shopify.com/' },
  { name: 'WooCommerce', icon: SiWoocommerce, url: 'https://woocommerce.com/' },
  { name: 'Google Ads', icon: SiGoogleads, url: 'https://ads.google.com/' },
  { name: 'Meta Ads', icon: SiMeta, url: 'https://www.facebook.com/business/ads' },
  { name: 'TikTok Ads', icon: SiTiktok, url: 'https://www.tiktok.com/business/' },
  { name: 'Spotify Ads', icon: SiSpotify, url: 'https://ads.spotify.com/' },
  { name: 'Google Analytics', icon: SiGoogleanalytics, url: 'https://analytics.google.com/' },
  { name: 'Mailchimp', icon: SiMailchimp, url: 'https://mailchimp.com/' },
];

// Lista completa de tecnologías de Backend, DevOps, Infraestructura, IA y Automatización
const backendAndInfra: TechInfo[] = [
  { name: 'Node.js', icon: SiNodedotjs, url: 'https://nodejs.org/' },
  { name: 'NestJS', icon: SiNestjs, url: 'https://nestjs.com/' },
  { name: 'Python', icon: SiPython, url: 'https://www.python.org/' },
  { name: 'Go', icon: SiGo, url: 'https://go.dev/' },
  { name: 'GraphQL', icon: SiGraphql, url: 'https://graphql.org/' },
  { name: 'PostgreSQL', icon: SiPostgresql, url: 'https://www.postgresql.org/' },
  { name: 'MongoDB', icon: SiMongodb, url: 'https://www.mongodb.com/' },
  { name: 'Redis', icon: SiRedis, url: 'https://redis.io/' },
  { name: 'Supabase', icon: SiSupabase, url: 'https://supabase.com/' },
  { name: 'Firebase', icon: SiFirebase, url: 'https://firebase.google.com/' },
  { name: 'Vercel', icon: SiVercel, url: 'https://vercel.com/' },
  { name: 'Netlify', icon: SiNetlify, url: 'https://www.netlify.com/' },
  { name: 'Git', icon: SiGit, url: 'https://git-scm.com/' },
  { name: 'GitHub', icon: SiGithub, url: 'https://github.com/' },
  { name: 'PNPM', icon: SiPnpm, url: 'https://pnpm.io/' },
  { name: 'OpenAI', icon: SiOpenai, url: 'https://openai.com/' },
  { name: 'Hugging Face', icon: SiHuggingface, url: 'https://huggingface.co/' },
  { name: 'TensorFlow', icon: SiTensorflow, url: 'https://www.tensorflow.org/' },
  { name: 'PyTorch', icon: SiPytorch, url: 'https://pytorch.org/' },
  { name: 'n8n', icon: SiN8n, url: 'https://n8n.io/' },
  { name: 'Zapier', icon: SiZapier, url: 'https://zapier.com/' },
];


type TechStackSectionProps = {
  dictionary: Dictionary['homepage']['value_proposition_section'];
};

// ===================================================================================
// SUB-COMPONENTE DE UI: Ítem de Tecnología
// ===================================================================================

/**
 * Renderiza un único ítem de tecnología clickeable para los carruseles.
 * @param {{ item: TechInfo }} props - Propiedades del componente.
 * @returns {JSX.Element} Un elemento <a> estilizado y optimizado para rendimiento y SEO.
 */
const TechItem = ({ item }: { item: TechInfo }) => (
  <a
    href={item.url}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={`Aprender más sobre ${item.name}`}
    className="group flex shrink-0 items-center gap-3 rounded-full border border-zinc-800 bg-zinc-900/50 px-6 py-3 transition-all duration-300 will-change-transform hover:scale-110 hover:bg-zinc-800/80 hover:shadow-lg hover:shadow-purple-500/20 hover:border-purple-500/30"
  >
    <item.icon className="h-6 w-6 text-zinc-500 transition-colors duration-300 group-hover:text-white" />
    <span className="text-sm font-medium text-zinc-400 transition-colors duration-300 group-hover:text-white">{item.name}</span>
  </a>
);

// ===================================================================================
// COMPONENTE PRINCIPAL DE LA SECCIÓN
// ===================================================================================

/**
 * Orquesta y renderiza la sección completa del stack tecnológico.
 * @param {TechStackSectionProps} props - Propiedades que incluyen el diccionario para i18n.
 * @returns {JSX.Element} El componente de sección con dos carruseles infinitos.
 */
export function TechStackSection({ dictionary }: TechStackSectionProps) {
  const trackFrontendRef = useRef<HTMLDivElement>(null);
  const trackBackendRef = useRef<HTMLDivElement>(null);

  useInfiniteCarouselAnimation([
    { ref: trackFrontendRef, duration: 120, direction: 1 },
    { ref: trackBackendRef, duration: 150, direction: -1 },
  ]);

  return (
    <section className="relative w-full overflow-hidden bg-zinc-950 py-16 sm:py-24">
      <div className="relative z-10">
        <div className="container mx-auto px-4 mb-16 text-center">
          <BlurText
            text={dictionary.tech_stack_title}
            className="font-display text-4xl font-bold text-white sm:text-5xl justify-center"
            animateBy="words"
          />
        </div>

        <div className="space-y-6">
          <div ref={trackFrontendRef} className="flex w-max gap-6">
            {[...frontendAndCreative, ...frontendAndCreative].map((tech, index) => <TechItem key={`${tech.name}-track1-${index}`} item={tech} />)}
          </div>

          <div ref={trackBackendRef} className="flex w-max gap-6">
            {[...backendAndInfra, ...backendAndInfra].map((tech, index) => <TechItem key={`${tech.name}-track2-${index}`} item={tech} />)}
          </div>
        </div>

        <div className="container mx-auto px-4 mt-16 text-center">
            <p className="text-sm text-zinc-500">
                {dictionary.tech_stack_cta}
            </p>
        </div>
      </div>
    </section>
  );
}
