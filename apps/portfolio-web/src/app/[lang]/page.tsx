/**
 * @file apps/portfolio-web/src/app/[lang]/page.tsx
 * @description Orquestador Soberano de la Recepción (Landing Page).
 *              Responsabilidad: Hidratación dinámica del Hero y Síntesis Visual.
 *              Refactorizado: Resolución de Linter (Heimdall v2.5), purificación
 *              de castings y optimización del Sovereign Join Architecture.
 * 
 * @version 8.0 - Linter Pure & Sovereign Join Hardened
 * @author Staff Engineer - MetaShark Tech
 */

import React from 'react';
import type { Metadata } from 'next';

/** IMPORTACIONES DE INFRAESTRUCTRURA (Nx Boundary Safe) */
import { getDictionary } from '../../lib/get-dictionary';
import { type Locale, i18n } from '../../config/i18n.config';
import { JsonLdScript } from '../../components/ui/JsonLdScript';
import { cn } from '../../lib/utils/cn';

/** 
 * IMPORTACIONES DE CONTRATO (SSoT) 
 */
import type { Media, Tenant } from '@metashark/cms-core';

/** APARATO DE SECCIÓN (Oxygen Engine) */
import { HeroCarousel } from '../../components/sections/homepage/HeroCarousel';
import { AboutSection } from '../../components/sections/homepage/AboutSection';
import { ValuePropositionSection } from '../../components/sections/homepage/ValuePropositionSection';
import { AiContentSection } from '../../components/sections/homepage/AiContentSection';
import { HistorySection } from '../../components/sections/homepage/HistorySection';
import type { OrbitalGalleryItem } from '../../components/razBits/OrbitalGallery';

/**
 * CONFIGURACIÓN DE INFRAESTRUCTRURA
 * @pilar X: Performance - Revalidación incremental para frescura de datos.
 */
export const dynamic = 'force-static';
export const revalidate = 3600; 

const MASTER_TENANT_ID = '00000000-0000-0000-0000-000000000001';
const IS_BUILD_ENV = process.env.NEXT_PHASE === 'phase-production-build' || process.env.VERCEL === '1';

/**
 * PROTOCOLO CROMÁTICO HEIMDALL v2.5
 */
const C = {
  reset: '\x1b[0m', magenta: '\x1b[35m', cyan: '\x1b[36m', 
  green: '\x1b[32m', red: '\x1b[31m', bold: '\x1b[1m'
};

/**
 * @function isMediaExpanded
 * @description Guardián de tipo para validar la hidratación de activos multimedia.
 */
function isMediaExpanded(media: string | Media | null | undefined): media is Media {
  return !!media && typeof media === 'object' && 'url' in media && typeof media.url === 'string';
}

/**
 * @function getDynamicPageData
 * @description Recupera el nodo del Tenant y la colección de activos para Visual Synth.
 * @pilar VIII: Resiliencia - Fallback a colecciones vacías si el Handshake falla.
 */
async function getDynamicPageData() {
  const traceId = `page_hsk_${Date.now().toString(36).toUpperCase()}`;
  
  if (IS_BUILD_ENV) return { tenant: null, aiItems: [] };

  try {
    const { getPayload } = await import('payload');
    const configModule = await import('@metashark/cms-core/config');
    const payload = await getPayload({ config: configModule.default });

    const [tenant, aiMedia] = await Promise.all([
      payload.findByID({ 
        collection: 'tenants', 
        id: MASTER_TENANT_ID, 
        depth: 1 
      }),
      payload.find({
        collection: 'media',
        where: {
          and: [
            { tenant: { equals: MASTER_TENANT_ID } },
            { assetContext: { equals: 'ai-synth' } }
          ]
        },
        limit: 12,
        sort: '-createdAt'
      })
    ]);

    if (process.env.NODE_ENV !== 'production') {
      console.info(`${C.magenta}${C.bold}[DNA][CMS]${C.reset} Page Handshake OK | Trace: ${traceId}`);
    }

    return { 
      tenant: tenant as unknown as Tenant, 
      aiItems: (aiMedia.docs as unknown) as Media[] 
    };
  } catch (error) {
    console.error(`${C.red}   ✕ [BREACH] Handshake failed during Page Orchestration.${C.reset}`, error);
    return { tenant: null, aiItems: [] };
  }
}

interface PageProps {
  params: Promise<{ lang: Locale }>;
}

export async function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { lang } = await props.params;
  const dict = await getDictionary(lang);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://beachhotelcanasvieiras.com';

  return { 
    title: dict.hero.page_title,
    description: dict.hero.page_description,
    alternates: { canonical: `${baseUrl}/${lang}` },
    openGraph: {
      title: dict.hero.page_title,
      description: dict.hero.page_description,
      url: `${baseUrl}/${lang}`,
      siteName: dict.header.personal_portfolio
    }
  };
}

/**
 * APARATO PRINCIPAL: HomePage
 * @pilar IX: Desacoplamiento - Realiza el Join Lógico entre CMS y MACS.
 */
export default async function HomePage(props: PageProps) {
  const { lang } = await props.params;
  
  // 1. HIDRATACIÓN SOBERANA (Paralela)
  const [dict, { tenant, aiItems }] = await Promise.all([
    getDictionary(lang),
    getDynamicPageData()
  ]);

  /**
   * 2. RESOLUCIÓN DE ACTIVOS DEL HERO
   * Prioriza los punteros de la DB sobre el fallback estático del JSON.
   */
  const heroConfig = tenant?.heroConfig;
  const dynamicHeroAssets = {
    ...dict.hero.assets,
    hotel: {
      video_url: isMediaExpanded(heroConfig?.activeHeroVideo) 
        ? (heroConfig.activeHeroVideo.url ?? dict.hero.assets.hotel.video_url)
        : dict.hero.assets.hotel.video_url,
      poster_url: isMediaExpanded(heroConfig?.activeHeroPoster) 
        ? (heroConfig.activeHeroPoster.url ?? dict.hero.assets.hotel.poster_url)
        : dict.hero.assets.hotel.poster_url,
      audio_url: isMediaExpanded(heroConfig?.activeHeroAudio) 
        ? (heroConfig.activeHeroAudio.url ?? dict.hero.assets.hotel.audio_url)
        : dict.hero.assets.hotel.audio_url,
    }
  };

  /** 
   * 3. JOIN LÓGICO: AI CONTENT RECONCILIATION
   * @description Cruza imágenes dinámicas (S3) con la narrativa editorial (JSON).
   */
  const galleryItems: OrbitalGalleryItem[] = aiItems.map((media) => {
    // Extraemos la llave técnica del filename (ej: "lobby-synth.webp" -> "lobby-synth")
    const filenameKey = media.filename?.split('.')[0] || '';
    
    // Buscamos correspondencia en el diccionario nivelado v8.0
    const metadata = dict.ai_gallery_section.items_metadata[filenameKey] || {
      title: media.alt,
      description: media.caption || ''
    };

    return {
      image: media.url || '',
      title: metadata.title,
      description: metadata.description
    };
  });

  return (
    <>
      {/* 4. DATOS ESTRUCTURADOS (SEO Elite) */}
      <JsonLdScript data={{ "@context": "https://schema.org", "@type": "Hotel", "name": dict.header.personal_portfolio }} />
      
      <main className={cn("flex flex-col w-full overflow-x-hidden bg-background selection:bg-primary/20")}>
        
        {/* FASE 1: AWARENESS (Branding & Impact) */}
        <HeroCarousel dictionary={{ ...dict.hero, assets: dynamicHeroAssets }} />
        
        {/* FASE 2: TRUST (Narrativa & Herencia) */}
        <AboutSection dictionary={dict.about} />
        
        {/* FASE 3: VALUE PROPOSITION (Diferenciación) */}
        <ValuePropositionSection dictionary={dict.value_proposition} />
        
        {/* FASE 4: VISUAL SYNTH (Diferenciación Tecnológica - WebGL) */}
        <AiContentSection 
          dictionary={dict.ai_gallery_section} 
          items={galleryItems} 
        />
        
        {/* FASE 5: LEGACY (Identidad de Autor) */}
        <HistorySection dictionary={dict.history} />
      </main>
    </>
  );
}