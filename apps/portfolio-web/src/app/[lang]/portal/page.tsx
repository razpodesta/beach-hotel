/**
 * @file apps/portfolio-web/src/app/[lang]/portal/page.tsx
 * @description Enterprise Operations Portal (HopEx v24.1).
 *              Refactorizado: Aislamiento total Build-Time mediante importaciones 
 *              dinámicas y guardias de entorno para evitar el crash de 'env' en Vercel.
 * @version 25.1 - Extreme Build Isolation (Runtime-Only CMS)
 * @author Staff Engineer - MetaShark Tech
 */

import React from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerClient } from '@supabase/ssr';
import { 
  Terminal, Hotel, Briefcase, User, Settings, LogOut, 
  Activity, LayoutGrid, type LucideIcon,
  Zap, Users, Send, Percent, QrCode, Database, Bell,
  ShieldCheck 
} from 'lucide-react';

/** IMPORTACIONES DE INFRAESTRUCTRURA */
import { getDictionary } from '../../../lib/get-dictionary';
import { type Locale } from '../../../config/i18n.config';
import { BlurText } from '../../../components/razBits/BlurText';
import { cn } from '../../../lib/utils/cn';

/** OPERATIONAL MANAGERS (Silos A, B, C, D) */
import { AdminMediaPanel } from '../../../components/sections/portal/AdminMediaPanel';
import { ArtifactShowcase } from '../../../components/sections/portal/ArtifactShowcase';
import { IngestionManager } from '../../../components/sections/portal/IngestionManager';
import { PartnerNetworkManager } from '../../../components/sections/portal/PartnerNetworkManager';
import { OffersDashboard } from '../../../components/sections/portal/OffersDashboard';
import { MarketingCloudManager } from '../../../components/sections/portal/MarketingCloudManager';
import { CommsHubManager } from '../../../components/sections/portal/CommsHubManager';
import type { AgencyEntity } from '../../../components/sections/portal/types';

/** IMPORTACIONES DE CONTRATO */
import type { EnterpriseRole } from '../../../lib/route-guard';

/**
 * DETECTORES DE ESTADO DE INFRAESTRUCTRURA
 * @pilar XIII: Impide que el motor de Payload intente arrancar en workers de compilación.
 */
const IS_BUILD_ENV = 
  process.env.NEXT_PHASE === 'phase-production-build' || 
  process.env.VERCEL === '1';

interface RoleBrandingConfig {
  color: string;
  glow: string;
  icon: LucideIcon;
  title: string;
}

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
 * @description Resuelve la identidad del operador consultando el clúster de Supabase y el CMS.
 */
async function getActiveEnterpriseSession(): Promise<EnterpriseSessionData | null> {
  // 1. EVALUACIÓN DE BYPASS TÉCNICO O FASE DE BUILD
  if (IS_BUILD_ENV) return null;

  if (process.env.NEXT_PUBLIC_AUTH_BYPASS === 'true') {
    return { 
      userId: 'ROOT_ADMIN_S0', role: 'developer', email: 'dev-ops@metashark.tech', 
      tenant: '00000000-0000-0000-0000-000000000001', xp: 3333,
      artifacts: ['monolito-obsidiana', 'terminal-fantasma', 'entidad-ia']
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
    /** 
     * @pilar XIII: Lazy Import.
     * Solo cargamos Payload si realmente hay un usuario autenticado.
     */
    const { getPayload } = await import('payload');
    const configModule = await import('@metashark/cms-core/config');
    
    const payload = await getPayload({ config: configModule.default });
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
 * @description Orquesta el acceso a las herramientas operativas del hotel con renderizado dinámico.
 */
export default async function PortalPage(props: PageProps) {
  const { lang } = await props.params;
  const { view } = await props.searchParams;
  const activeView = view || 'overview';
  
  const session = await getActiveEnterpriseSession();
  
  // Guardia de Build: Si no hay sesión (o es Build), evacuamos preventivamente.
  if (!session) {
    if (IS_BUILD_ENV) return <div className="min-h-screen bg-background" />;
    redirect(`/${lang}`);
  }

  console.group(`[HEIMDALL][PORTAL] Entry: ${session.email} | View: ${activeView}`);

  // 2. ORQUESTACIÓN PARALELA DE DATOS (Pilar X)
  const [dict, partnerInventory] = await Promise.all([
    getDictionary(lang),
    (async () => {
      const isManager = session.role === 'admin' || session.role === 'developer';
      if (activeView === 'partner-hub' && (isManager || session.role === 'operator')) {
        const { getPayload } = await import('payload');
        const configModule = await import('@metashark/cms-core/config');
        const payload = await getPayload({ config: configModule.default });
        
        const result = await payload.find({
          collection: 'agencies',
          where: session.tenant ? { tenant: { equals: session.tenant } } : {},
          limit: 50, sort: '-trustScore'
        });
        return result.docs as unknown as AgencyEntity[];
      }
      return [];
    })()
  ]);

  console.groupEnd();

  const t = dict.portal;
  const role: EnterpriseRole = session.role;
  
  const brandingMap: Record<EnterpriseRole, RoleBrandingConfig> = {
    developer: { color: 'text-purple-400', glow: 'bg-purple-500', icon: Terminal, title: t.welcome_developer },
    admin: { color: 'text-blue-400', glow: 'bg-blue-500', icon: Hotel, title: t.welcome_admin },
    operator: { color: 'text-emerald-400', glow: 'bg-emerald-500', icon: Briefcase, title: t.welcome_operator },
    sponsor: { color: 'text-yellow-400', glow: 'bg-yellow-500', icon: ShieldCheck, title: t.welcome_guest },
    guest: { color: 'text-pink-400', glow: 'bg-pink-500', icon: User, title: t.welcome_guest },
    anonymous: { color: 'text-zinc-400', glow: 'bg-zinc-500', icon: User, title: t.welcome_guest }
  };

  const currentBranding = brandingMap[role] || brandingMap.anonymous;

  const operationSilos = [
    { group: "Core Operations", items: [{ id: 'overview', label: t.nav_overview, icon: Activity, roles: null }, { id: 'inventory', label: t.nav_inventory, icon: LayoutGrid, roles: ['admin', 'developer'] }] },
    { group: "Silo A: Revenue", items: [{ id: 'offers-revenue', label: 'Revenue Dashboard', icon: Zap, roles: ['admin', 'developer'] }, { id: 'offers-enterprise', label: 'B2B Wholesale', icon: Percent, roles: ['admin', 'developer', 'operator'] }] },
    { group: "Silo B: Partners", items: [{ id: 'partner-hub', label: dict.partner_network.title, icon: Users, roles: ['admin', 'developer', 'operator'] }, { id: 'partner-onboarding', label: 'Auth Gateway', icon: QrCode, roles: ['admin', 'developer'] }] },
    { group: "Silo C: Intelligence", items: [{ id: 'data-pipeline', label: 'Ingestion Vault', icon: Database, roles: ['admin', 'developer'] }, { id: 'marketing-cloud', label: 'Marketing Cloud', icon: Send, roles: ['admin', 'developer'] }] },
    { group: "Silo D: Communications", items: [{ id: 'comms-hub', label: 'Signal Stream', icon: Bell, roles: null }, { id: 'settings', label: t.cta_settings, icon: Settings, roles: null }] }
  ];

  return (
    <main className="min-h-screen bg-background text-foreground pt-32 pb-24 selection:bg-primary/20 transition-colors duration-1000">
      <div className="container mx-auto px-6">
        
        <header className="mb-20 flex flex-col md:flex-row items-start justify-between border-b border-border/50 pb-12 gap-8">
           <div className="space-y-6">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[8px] font-bold uppercase tracking-widest animate-fade-in">
                <ShieldCheck size={10} /> {session.role} LEVEL_S{session.xp > 1000 ? '0' : '4'}
             </div>
             <BlurText text={currentBranding.title.toUpperCase()} className="font-display text-5xl md:text-6xl font-bold tracking-tighter text-foreground" delay={50} />
             <div className="flex items-center gap-4 text-sm font-light opacity-60 italic">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                {session.email}
             </div>
           </div>
           
           <button className="flex items-center gap-4 px-10 py-5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-[10px] uppercase tracking-[0.3em] transition-all hover:bg-red-500 hover:text-white active:scale-95 shadow-xl">
             <LogOut size={16} /> {t.cta_logout}
           </button>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <aside className="lg:col-span-3 space-y-10">
            {operationSilos.map((silo) => {
              const authorizedItems = silo.items.filter(item => 
                !item.roles || (item.roles as EnterpriseRole[]).includes(session.role)
              );

              if (authorizedItems.length === 0) return null;

              return (
                <div key={silo.group} className="space-y-4">
                  <h4 className="px-6 text-[9px] font-bold text-muted-foreground uppercase tracking-[0.5em] opacity-40">{silo.group}</h4>
                  <div className="space-y-1">
                    {authorizedItems.map((nav) => (
                      <Link 
                        key={nav.id} 
                        href={`/${lang}/portal?view=${nav.id}`} 
                        className={cn(
                          "group flex items-center justify-between px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all",
                          activeView === nav.id 
                            ? "bg-foreground text-background shadow-2xl scale-[1.02]" 
                            : "hover:bg-surface text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <nav.icon size={16} className={cn("transition-colors", activeView === nav.id ? "text-primary" : "group-hover:text-primary")} /> 
                          {nav.label}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </aside>

          <div className="lg:col-span-9 min-h-[600px]">
            <div
              key={activeView}
              className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both"
            >
              {activeView === 'overview' && (
                <ArtifactShowcase userXp={session.xp} ownedIds={session.artifacts} dictionary={dict.gamification} />
              )}
              {activeView === 'inventory' && (
                <AdminMediaPanel mediaLabels={dict.admin_media} />
              )}
              {(activeView === 'offers-revenue' || activeView === 'offers-enterprise') && (
                <OffersDashboard dictionary={dict} />
              )}
              {activeView === 'partner-hub' && (
                <PartnerNetworkManager agencies={partnerInventory} dictionary={dict.partner_network} />
              )}
              {activeView === 'data-pipeline' && (
                <IngestionManager dictionary={dict.ingestion_vault} />
              )}
              {activeView === 'marketing-cloud' && (
                <MarketingCloudManager dictionary={dict.marketing_cloud} />
              )}
              {activeView === 'comms-hub' && (
                <CommsHubManager dictionary={dict.comms_hub} />
              )}
              {activeView === 'settings' && (
                <div className="py-40 text-center rounded-[4rem] border border-dashed border-border bg-surface/20">
                   <Settings size={48} className="mx-auto text-muted-foreground/20 mb-6" />
                   <p className="text-sm font-mono text-muted-foreground uppercase tracking-[0.4em]">Configuration Node Under Maintenance</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}