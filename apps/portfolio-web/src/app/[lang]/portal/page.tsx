/**
 * @file apps/portfolio-web/src/app/[lang]/portal/page.tsx
 * @description Enterprise Operations Portal (HopEx v4.0).
 *              Orquestador central de la infraestructura MetaShark.
 *              Gestiona la integración de los Silos A, B, C y D bajo un modelo
 *              de arquitectura atómica y seguridad de grado industrial.
 * @version 22.0 - Enterprise Level 4.0 | Dynamic Prop Extraction
 * @author Staff Engineer - MetaShark Tech
 */

import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getPayload, type CollectionSlug } from 'payload';
import configPromise from '@metashark/cms-core/config';
import { createServerClient } from '@supabase/ssr';
import { 
  Terminal, Hotel, Briefcase, User, Settings, LogOut, 
  Activity, ShieldCheck, LayoutGrid, type LucideIcon,
  Zap, Users, Send, Percent, QrCode, Database, 
  Bell, AlertTriangle
} from 'lucide-react';

/** IMPORTACIONES DE INFRAESTRUCTRURA (SSoT) */
import { getDictionary } from '../../../lib/get-dictionary';
import { type Locale } from '../../../config/i18n.config';
import { BlurText } from '../../../components/razBits/BlurText';
import { FadeIn } from '../../../components/ui/FadeIn';
import { cn } from '../../../lib/utils/cn';
import { getPortalData } from '../../../lib/portal-api';

/** OPERATIONAL MANAGERS (Silos A, B, C, D) */
import { AdminMediaPanel } from '../../../components/sections/portal/AdminMediaPanel';
import { InventoryExplorer } from '../../../components/sections/portal/media/InventoryExplorer';
import { ArtifactShowcase } from '../../../components/sections/portal/ArtifactShowcase';
import { IngestionManager } from '../../../components/sections/portal/IngestionManager';
import { PartnerManagement } from '../../../components/sections/portal/PartnerManagement';

/** IMPORTACIONES DE CONTRATO */
import type { EnterpriseRole } from '../../../lib/route-guard';
import { shapeMediaEntity } from '../../../lib/portal';
import type { PayloadMediaDoc } from '@metashark/cms-core';

/**
 * EXTRACCIÓN DINÁMICA DE CONTRATO (Pilar III)
 * Asegura que el casteo coincida exactamente con lo que el componente destino requiere
 * sin necesidad de acoplar interfaces no exportadas.
 */
type PartnerAgencies = React.ComponentProps<typeof PartnerManagement>['agencies'];

/**
 * @interface RoleBrandingConfig
 * @description Define la identidad cromática industrial por nivel de autoridad.
 */
interface RoleBrandingConfig {
  color: string;
  glow: string;
  icon: LucideIcon;
  title: string;
}

/**
 * @interface EnterpriseSessionData
 * @description Contrato inmutable de sesión sincronizada.
 */
interface EnterpriseSessionData {
  userId: string;
  role: EnterpriseRole;
  email: string;
  tenant: string | null;
  xp: number;
  artifacts: string[];
}

/**
 * MODULE: getActiveEnterpriseSession
 * @description Sincroniza la identidad del usuario con el Clúster de Autenticación.
 */
async function getActiveEnterpriseSession(): Promise<EnterpriseSessionData | null> {
  // Protocolo de Bypass para Desarrollo (Staff Bypass Mode)
  if (process.env.NEXT_PUBLIC_AUTH_BYPASS === 'true') {
    return { 
      userId: 'ROOT_ADMIN_S0', role: 'developer', email: 'dev-ops@metashark.tech', 
      tenant: '00000000-0000-0000-0000-000000000001', xp: 3333,
      artifacts: ['monolito-obsidiana', 'terminal-fantasma']
    };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  if (!supabaseUrl || !supabaseAnonKey) return null;

  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: { getAll() { return cookieStore.getAll(); } },
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  try {
    const payload = await getPayload({ config: await configPromise });
    const { docs } = await payload.find({
      collection: 'users',
      where: { email: { equals: user.email ?? '' } },
      limit: 1
    });
    const profile = docs[0];
    
    return {
      userId: user.id,
      role: (profile?.role as EnterpriseRole) || 'guest',
      email: user.email ?? 'anonymous@meta-platform.tech',
      tenant: typeof profile?.tenant === 'object' ? profile.tenant.id : (profile?.tenant || null),
      xp: profile?.experiencePoints ?? 0,
      artifacts: profile?.level ? ['monolito-obsidiana'] : [] 
    };
  } catch (error) {
    console.error('[CORE][AUTH] Identity link failure:', error);
    return null;
  }
}

interface PageProps {
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{ view?: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { lang } = await props.params;
  const dict = await getDictionary(lang);
  return { title: `${dict.portal.nav_overview} | Platform Operations` };
}

/**
 * APARATO PRINCIPAL: PortalPage
 * @description Orquestador de la Terminal de Inteligencia Corporativa.
 */
export default async function PortalPage(props: PageProps) {
  const { lang } = await props.params;
  const { view } = await props.searchParams;
  const activeView = view || 'overview';
  const session = await getActiveEnterpriseSession();

  if (!session) redirect(`/${lang}/login`);

  /** 
   * DATA PIPELINE: ORQUESTACIÓN MULTI-SILO
   * @pilar X: Performance - Carga concurrente de recursos de red.
   */
  const [dict, portalTelemetry, mediaRepository, partnerInventory] = await Promise.all([
    getDictionary(lang),
    getPortalData(session.role, session.userId),
    
    // Ingesta de Silo: Assets Repository
    (async () => {
      const isStaff = session.role === 'admin' || session.role === 'developer';
      if (activeView === 'inventory' && isStaff) {
        const payload = await getPayload({ config: await configPromise });
        const result = await payload.find({
          collection: 'media',
          where: session.tenant ? { tenant: { equals: session.tenant } } : {},
          limit: 100, sort: '-createdAt'
        });
        return result.docs;
      }
      return [];
    })(),

    // Ingesta de Silo: B2B Network Inventory
    (async () => {
      const isManager = session.role === 'admin' || session.role === 'developer';
      if (activeView === 'partner-hub' && isManager) {
        const payload = await getPayload({ config: await configPromise });
        const result = await payload.find({
          collection: 'agencies' as CollectionSlug,
          where: session.tenant ? { tenant: { equals: session.tenant } } : {},
          limit: 50, sort: '-trustScore'
        });
        return result.docs;
      }
      return [];
    })()
  ]);

  const t = dict.portal;
  const role: EnterpriseRole = session.role;

  const BRANDING_REGISTRY: Record<EnterpriseRole, RoleBrandingConfig> = {
    developer: { color: 'text-purple-400', glow: 'bg-purple-500', icon: Terminal, title: t.welcome_developer },
    admin: { color: 'text-blue-400', glow: 'bg-blue-500', icon: Hotel, title: t.welcome_admin },
    operator: { color: 'text-emerald-400', glow: 'bg-emerald-500', icon: Briefcase, title: t.welcome_operator },
    sponsor: { color: 'text-yellow-400', glow: 'bg-yellow-500', icon: ShieldCheck, title: t.welcome_guest },
    guest: { color: 'text-pink-400', glow: 'bg-pink-500', icon: User, title: t.welcome_guest },
    anonymous: { color: 'text-zinc-400', glow: 'bg-zinc-500', icon: User, title: t.welcome_guest }
  };

  const currentBranding = BRANDING_REGISTRY[role];
  const ViewIcon = currentBranding.icon;
  
  // Normalización de Activos (Pilar V)
  const formattedMedia = mediaRepository.map(doc => shapeMediaEntity(doc as unknown as PayloadMediaDoc));

  /** MAPA DE NAVEGACIÓN INDUSTRIAL (Silos A, B, C, D) */
  const operationSilos = [
    {
      group: "Core Operations",
      items: [
        { id: 'overview', label: t.nav_overview, icon: Activity, roles: null },
        { id: 'inventory', label: t.nav_inventory, icon: LayoutGrid, roles: ['admin', 'developer'] },
      ]
    },
    {
      group: "Silo A: Revenue Engine",
      items: [
        { id: 'offers-flash', label: dict.offers_flash.title, icon: Zap, roles: ['admin', 'developer'] },
        { id: 'offers-enterprise', label: 'B2B/Wholesale Rates', icon: Percent, roles: ['admin', 'developer', 'operator'] },
      ]
    },
    {
      group: "Silo B: Partner Network",
      items: [
        { id: 'partner-hub', label: dict.partner_network.title, icon: Users, roles: ['admin', 'developer', 'operator'] },
        { id: 'partner-onboarding', label: dict.partner_network.agent_management.add_agent, icon: QrCode, roles: ['admin', 'developer'] },
      ]
    },
    {
      group: "Silo C: Marketing Cloud",
      items: [
        { id: 'data-pipeline', label: dict.ingestion_vault.title, icon: Database, roles: ['admin', 'developer'] },
        { id: 'marketing-cloud', label: dict.marketing_cloud.title, icon: Send, roles: ['admin', 'developer'] },
      ]
    },
    {
      group: "Silo D: Infrastructure",
      items: [
        { id: 'comms-hub', label: dict.comms_hub.title, icon: Bell, roles: null },
        { id: 'telemetry-l0', label: 'System Telemetry', icon: Terminal, roles: ['developer'] },
        { id: 'settings', label: t.cta_settings, icon: Settings, roles: null },
      ]
    }
  ];

  return (
    <main className="min-h-screen bg-background text-foreground pt-32 pb-24 transition-colors duration-1000">
      <div className="container mx-auto px-6">
        
        {/* --- 1. OPERATIONAL COMMAND HEADER --- */}
        <header className="mb-20 flex flex-col md:flex-row items-start md:items-end justify-between gap-8 border-b border-border/50 pb-12">
          <div className="space-y-6">
            <FadeIn delay={0.1}>
              <div className={cn("inline-flex items-center gap-3 font-mono text-[10px] font-bold uppercase tracking-[0.4em]", currentBranding.color)}>
                <div className="relative flex h-2 w-2">
                  <div className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75", currentBranding.glow)} />
                  <div className={cn("relative inline-flex h-2 w-2 rounded-full", currentBranding.glow)} />
                </div>
                {t.status_active_session} • {role.toUpperCase()}
              </div>
            </FadeIn>
            <BlurText text={currentBranding.title.toUpperCase()} className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-foreground" delay={50} />
            <p className="text-muted-foreground text-sm font-sans italic opacity-60">
              {session.email} • {t.last_sync_label}: {new Date().toLocaleTimeString()}
            </p>
          </div>
          <button className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest active:scale-95">
             <LogOut size={16} /> {t.cta_logout}
          </button>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          
          {/* --- 2. OPERATIONAL SIDEBAR --- */}
          <aside className="md:col-span-3 space-y-10">
            {operationSilos.map((silo) => (
              <div key={silo.group} className="space-y-3">
                <h4 className="px-4 text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.4em]">{silo.group}</h4>
                <div className="space-y-1">
                  {silo.items.map((nav) => {
                    if (nav.roles && !nav.roles.includes(role)) return null;
                    const isTabActive = activeView === nav.id;
                    return (
                      <Link 
                        key={nav.id} href={`/${lang}/portal?view=${nav.id}`}
                        className={cn(
                          "w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all",
                          isTabActive ? "bg-primary text-white shadow-xl translate-x-2" : "hover:bg-surface text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <nav.icon size={16} /> {nav.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </aside>

          {/* --- 3. MULTI-SILO VIEWPORT --- */}
          <div className="md:col-span-9 space-y-12">
            
            {/* ALERT SYSTEM (Heimdall) */}
            {portalTelemetry.notifications.length > 0 && (
              <FadeIn delay={0.1} className="space-y-4">
                 {portalTelemetry.notifications.map((note) => (
                   <div key={note.id} className="flex items-center gap-4 p-5 rounded-2xl border bg-surface/30 border-border/50 backdrop-blur-md">
                     {note.type === 'info' ? <Bell size={18} className="text-primary" /> : <AlertTriangle size={18} className="text-yellow-500" />}
                     <span className="text-[10px] font-bold uppercase tracking-widest">{note.message}</span>
                   </div>
                 ))}
              </FadeIn>
            )}
            
            {/* VIEW: REPUTACIÓN & ARTEFACTOS */}
            {activeView === 'overview' && (
              <FadeIn delay={0.2} className="space-y-12">
                 <header className="px-4"><h3 className="font-display text-4xl font-bold text-foreground tracking-tighter uppercase">{dict.gamification.artifacts_title}</h3></header>
                 <ArtifactShowcase userXp={session.xp} ownedIds={session.artifacts} dictionary={dict.gamification} />
              </FadeIn>
            )}

            {/* VIEW: ASSETS REPOSITORY (Inventory) */}
            {activeView === 'inventory' && (role === 'admin' || role === 'developer') && (
              <FadeIn delay={0.2} className="space-y-16">
                 <AdminMediaPanel mediaLabels={dict.admin_media} />
                 <div className="pt-12 border-t border-border/50">
                   <div className="mb-10 px-4"><h3 className="font-display text-2xl font-bold text-foreground uppercase tracking-tight">Enterprise Asset Inventory</h3></div>
                   <InventoryExplorer items={formattedMedia} dictionary={dict.admin_media} />
                 </div>
              </FadeIn>
            )}

            {/* VIEW: DATA PIPELINE (Ingestion) */}
            {activeView === 'data-pipeline' && (
              <FadeIn delay={0.2} className="space-y-12">
                 <header className="px-4"><h3 className="font-display text-4xl font-bold text-foreground tracking-tighter uppercase">{dict.ingestion_vault.title}</h3></header>
                 <IngestionManager dictionary={dict.ingestion_vault} />
              </FadeIn>
            )}

            {/* VIEW: B2B PARTNER NETWORK */}
            {activeView === 'partner-hub' && (
               <FadeIn delay={0.2} className="space-y-12">
                  <header className="px-4"><h3 className="font-display text-4xl font-bold text-foreground tracking-tighter uppercase">{dict.partner_network.title}</h3></header>
                  {/* Extracción dinámica segura sin dependencias circulares */}
                  <PartnerManagement agencies={partnerInventory as unknown as PartnerAgencies} dictionary={dict.partner_network} />
               </FadeIn>
            )}

            {/* FALLBACK: SILO IN CONSTRUCTION */}
            {!['overview', 'inventory', 'data-pipeline', 'partner-hub'].includes(activeView) && (
              <FadeIn delay={0.2}>
                <div className="min-h-[500px] rounded-[4rem] border border-border bg-surface/30 backdrop-blur-md p-16 flex flex-col items-center justify-center text-center">
                   <div className="relative mb-10">
                      <div className={cn("absolute -inset-10 blur-3xl rounded-full opacity-10", currentBranding.glow)} />
                      <div className="p-8 rounded-full bg-background border border-border">
                         <ViewIcon size={64} className={currentBranding.color} strokeWidth={1} />
                      </div>
                   </div>
                   <h3 className="font-display text-3xl font-bold mb-4 uppercase tracking-tighter">
                      {activeView.replace('-', ' ').toUpperCase()} <br />
                      <span className="text-primary opacity-50">Operational Unit</span>
                   </h3>
                   <p className="text-muted-foreground max-w-md mx-auto text-sm italic opacity-60">
                      Módulo corporativo em fase de sincronização. Bem-vindo ao centro de comando de {currentBranding.title}.
                   </p>
                </div>
              </FadeIn>
            )}
          </div>
        </section>
      </div>

      <div className={cn("fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,var(--color-primary),transparent_70%)] pointer-events-none opacity-[0.03]")} />
    </main>
  );
}