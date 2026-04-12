/**
 * @file apps/portfolio-web/src/app/[lang]/page.tsx
 * @description Orquestador Soberano de la Recepción (Landing Page).
 *              Responsabilidad: Hidratación dinámica del Hero y Síntesis Visual.
 *              Refactorizado: Resolución de TS2724 (Tenant Sync) y TS2741 (AI Items).
 *              Implementa Join Lógico entre Media Vault S3 y Diccionarios MACS.
 * 
 * @version 7.0 - Sovereign Join Architecture & Naming Sync
 * @author Staff Engineer - MetaShark Tech
 * 
 * @pilar III: Seguridad de Tipos - Sincronía con la interfaz 'Tenant' nivelada v16.0.
 * @pilar IX: Desacoplamiento - La lógica de ensamble IA reside exclusivamente aquí.
 * @pilar XIII: Build Isolation - Centinela de fase para evitar fallos en el CI/CD de Vercel.
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
 * @fix TS2724: Sincronización con el Core v16.0 (Tenant en singular).
 */
import type { Media, Tenant } from '@metashark/cms-core';

/** APARATOS DE SECCIÓN (Oxygen Engine) */
import { HeroCarousel } from '../../components/sections/homepage/HeroCarousel';
import { AboutSection } from '../../components/sections/homepage/AboutSection';
import { ValuePropositionSection } from '../../components/sections/homepage/ValuePropositionSection';
import { AiContentSection } from '../../components/sections/homepage/AiContentSection';
import { HistorySection } from '../../components/sections/homepage/HistorySection';
import type { OrbitalGalleryItem } from '../../components/razBits/OrbitalGallery';

/**
 * CONFIGURACIÓN DE INFRAESTRUCTRURA
 */
export const dynamic = 'force-static';
export const revalidate = 3600; // Refresco de activos IA cada 60 minutos.

const MASTER_TENANT_ID = '00000000-0000-0000-0000-000000000001';
const IS_BUILD_ENV = process.env.NEXT_PHASE === 'phase-production-build' || process.env.VERCEL === '1';

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

    return { 
      tenant: tenant as unknown as Tenant, 
      aiItems: (aiMedia.docs as unknown) as Media[] 
    };
  } catch (error) {
    console.error('[HEIMDALL][CMS] Handshake failed during Page Orchestration.', error);
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
   * @fix TS2741: Provisión del array 'items' requerido por AiContentSection.
   */
  const galleryItems: OrbitalGalleryItem[] = aiItems.map((media) => {
    // Extraemos la llave técnica del filename (ej: "lobby-synth.webp" -> "lobby-synth")
    const filenameKey = media.filename?.split('.')[0] || '';
    
    // Buscamos correspondencia en el diccionario nivelado v7.0
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
      <JsonLdScript data={{ "@context": "https://schema.org", "@type": "Hotel", "name": dict.header.personal_portfolio }} />
      
      <main className={cn("flex flex-col w-full overflow-x-hidden bg-background selection:bg-primary/20")}>
        
        {/* FASE 1: AWARENESS */}
        <HeroCarousel dictionary={{ ...dict.hero, assets: dynamicHeroAssets }} />
        
        {/* FASE 2: TRUST */}
        <AboutSection dictionary={dict.about} />
        
        {/* FASE 3: VALUE PROPOSITION */}
        <ValuePropositionSection dictionary={dict.value_proposition} />
        
        {/* FASE 4: VISUAL SYNTH (Silo C Dynamic Handshake) */}
        <AiContentSection 
          dictionary={dict.ai_gallery_section} 
          items={galleryItems} 
        />
        
        {/* FASE 5: LEGACY */}
        <HistorySection dictionary={dict.history} />
      </main>
    </>
  );
}