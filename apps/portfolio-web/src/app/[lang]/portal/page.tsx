/**
 * @file apps/portfolio-web/src/app/[lang]/portal/page.tsx
 * @description Enterprise Operations Portal (HopEx v25.1).
 *              Orquestador supremo de la interfaz operativa. Gestiona la convergencia
 *              de identidades, acceso por silos y telemetría Protocolo 33.
 *              Refactorizado: Resolución de TS2307 tras atomización de Silos B/C,
 *              normalización de rutas de barril y sellado de tipos SSoT.
 * @version 28.0 - Atomic Silo Integration & Path Sync
 * @author Staff Engineer - MetaShark Tech
 */

import React from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { 
  Terminal, Hotel, Briefcase, User, Settings, LogOut, 
  Activity, LayoutGrid, type LucideIcon,
  Zap, Users, Send, Percent, QrCode, Database, Bell,
  ShieldCheck
} from 'lucide-react';

/** IMPORTACIONES DE INFRAESTRUCTRURA (Fronteras Nx) */
import { getDictionary } from '../../../lib/get-dictionary';
import { type Locale } from '../../../config/i18n.config';
import { BlurText } from '../../../components/razBits/BlurText';
import { cn } from '../../../lib/utils/cn';
import Link from 'next/link';

/** 
 * OPERATIONAL MANAGERS (SBU Modules)
 * @pilar V: Adherencia Arquitectónica. Reconexión con Silos atomizados.
 */
import { AdminMediaPanel } from '../../../components/sections/portal/AdminMediaPanel';
import { ArtifactShowcase } from '../../../components/sections/portal/ArtifactShowcase';
import { IngestionManager } from '../../../components/sections/portal/IngestionManager';
import { PartnerNetworkManager } from '../../../components/sections/portal/partners'; // @fix: TS2307 Resolved
import { OffersDashboard } from '../../../components/sections/portal/OffersDashboard';
import { MarketingCloudManager } from '../../../components/sections/portal/marketing'; // @fix: TS2307 Resolved
import { CommsHubManager } from '../../../components/sections/portal/CommsHubManager';
import type { AgencyEntity } from '../../../components/sections/portal/types';

/** 
 * IMPORTACIONES DE CONTRATO (Pure Types Only)
 */
import type { SovereignRoleType } from '@metashark/cms-core';

// --- PROTOCOLO DE OBSERVABILIDAD CROMÁTICA ---
const C = {
  reset: '\x1b[0m', cyan: '\x1b[36m', green: '\x1b[32m', 
  yellow: '\x1b[33m', magenta: '\x1b[35m', bold: '\x1b[1m', red: '\x1b[31m'
};

const IS_BUILD_ENV = 
  process.env.NEXT_PHASE === 'phase-production-build' || 
  process.env.VERCEL === '1';

interface RoleBranding {
  color: string;
  glow: string;
  icon: LucideIcon;
  titleKey: keyof typeof import('../../../dictionaries/pt-BR.json')['portal'];
}

interface EnterpriseSessionData {
  userId: string;
  role: SovereignRoleType;
  email: string;
  tenant: string | null;
  xp: number;
  artifacts: string[];
  traceId: string;
}

/**
 * @function resolveIdentityNode
 * @description Handshake de doble capa (Supabase + Payload) con medición de latencia.
 */
async function resolveIdentityNode(traceId: string): Promise<EnterpriseSessionData | null> {
  const start = performance.now();
  
  if (IS_BUILD_ENV) return null;

  if (process.env.NEXT_PUBLIC_AUTH_BYPASS === 'true') {
    return { 
      userId: 'S0_ROOT', role: 'developer', email: 'dev-ops@metashark.tech', 
      tenant: '00000000-0000-0000-0000-000000000001', xp: 3333,
      artifacts: ['monolito-obsidiana', 'terminal-fantasma'], traceId 
    };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  
  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: { getAll() { return cookieStore.getAll(); } },
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  try {
    const { getPayload } = await import('payload');
    const configModule = await import('@metashark/cms-core/config');
    const payload = await getPayload({ config: configModule.default });
    
    const { docs } = await payload.find({
      collection: 'users',
      where: { email: { equals: user.email ?? '' } },
      limit: 1,
      depth: 0
    });
    
    const profile = docs[0];
    const duration = (performance.now() - start).toFixed(2);
    
    console.log(`${C.green}   ✓ [DNA][AUTH]${C.reset} Trace: ${traceId} | Identity Linked | Lat: ${duration}ms`);
    
    return {
      userId: user.id,
      role: (profile?.role as SovereignRoleType) || 'guest',
      email: user.email ?? '',
      tenant: typeof profile?.tenant === 'object' ? profile.tenant.id : (profile?.tenant || null),
      xp: profile?.experiencePoints ?? 0,
      artifacts: profile?.level ? ['monolito-obsidiana'] : [],
      traceId
    };
  } catch (error) {
    console.error(`${C.red}   ✕ [DNA][AUTH]${C.reset} Handshake aborted in Silo D. Trace: ${traceId}`, error);
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
 * @description Centro de mando para la orquestación de operaciones y reputación.
 * @pilar IX: Inversión de Control. Delega la lógica de negocio a los Silos Managers.
 */
export default async function PortalPage(props: PageProps) {
  const pageStart = performance.now();
  const traceId = `trace_portal_${Date.now().toString(36).toUpperCase()}`;
  
  const { lang } = await props.params;
  const { view } = await props.searchParams;
  const activeView = view || 'overview';
  
  // Handshake de Identidad y Autoridad
  const session = await resolveIdentityNode(traceId);
  
  if (!session) {
    if (IS_BUILD_ENV) return <div className="min-h-screen bg-background" />;
    redirect(`/${lang}`);
  }

  /**
   * RECUPERACIÓN ASÍNCRONA DE RECURSOS (Pilar X)
   * @description Hidratación táctica basada en la vista activa para minimizar TTFB.
   */
  const [dict, partnerInventory] = await Promise.all([
    getDictionary(lang),
    (async () => {
      // Lazy load del Silo B solo si la vista lo requiere
      if (activeView === 'partner-hub') {
        const { getPayload } = await import('payload');
        const configModule = await import('@metashark/cms-core/config');
        const payload = await getPayload({ config: configModule.default });
        
        const result = await payload.find({
          collection: 'agencies',
          where: session.tenant ? { tenant: { equals: session.tenant } } : {},
          limit: 50, 
          sort: '-trustScore'
        });
        return result.docs as unknown as AgencyEntity[];
      }
      return [];
    })()
  ]);

  const t = dict.portal;
  
  const brandingMap: Record<SovereignRoleType, RoleBranding> = {
    developer: { color: 'text-purple-400', glow: 'bg-purple-500', icon: Terminal, titleKey: 'welcome_developer' },
    admin: { color: 'text-blue-400', glow: 'bg-blue-500', icon: Hotel, titleKey: 'welcome_admin' },
    operator: { color: 'text-emerald-400', glow: 'bg-emerald-500', icon: Briefcase, titleKey: 'welcome_operator' },
    sponsor: { color: 'text-yellow-400', glow: 'bg-yellow-500', icon: Zap, titleKey: 'welcome_guest' },
    guest: { color: 'text-pink-400', glow: 'bg-pink-500', icon: User, titleKey: 'welcome_guest' }
  };

  const currentBranding = brandingMap[session.role] || brandingMap.guest;

  const operationSilos = [
    { group: "Core Operations", items: [
      { id: 'overview', label: t.nav_overview, icon: Activity, roles: null }, 
      { id: 'inventory', label: t.nav_inventory, icon: LayoutGrid, roles: ['admin', 'developer'] }
    ]},
    { group: "Silo A: Revenue", items: [
      { id: 'offers-revenue', label: 'Revenue Dashboard', icon: Zap, roles: ['admin', 'developer'] }, 
      { id: 'offers-enterprise', label: 'B2B Wholesale', icon: Percent, roles: ['admin', 'developer', 'operator'] }
    ]},
    { group: "Silo B: Partners", items: [
      { id: 'partner-hub', label: dict.partner_network.title, icon: Users, roles: ['admin', 'developer', 'operator'] }, 
      { id: 'partner-onboarding', label: 'Auth Gateway', icon: QrCode, roles: ['admin', 'developer'] }
    ]},
    { group: "Silo C: Intelligence", items: [
      { id: 'data-pipeline', label: 'Ingestion Vault', icon: Database, roles: ['admin', 'developer'] }, 
      { id: 'marketing-cloud', label: 'Marketing Cloud', icon: Send, roles: ['admin', 'developer'] }
    ]},
    { group: "Silo D: Communications", items: [
      { id: 'comms-hub', label: 'Signal Stream', icon: Bell, roles: null }, 
      { id: 'settings', label: t.cta_settings, icon: Settings, roles: null }
    ]}
  ];

  const pageDuration = (performance.now() - pageStart).toFixed(2);
  console.log(`${C.magenta}[DNA][PORTAL]${C.reset} View ready: ${activeView} | Trace: ${traceId} | Time: ${pageDuration}ms`);

  return (
    <main className="min-h-screen bg-background text-foreground pt-32 pb-24 selection:bg-primary/20 transition-colors duration-1000">
      <div className="container mx-auto px-6">
        
        {/* --- 1. CABECERA OPERATIVA (DNA UI) --- */}
        <header className="mb-20 flex flex-col md:flex-row items-start justify-between border-b border-border/50 pb-12 gap-8 relative overflow-hidden">
           <div className="space-y-6 relative z-10">
             <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-surface border border-border/50 text-[9px] font-bold uppercase tracking-widest shadow-inner">
                <ShieldCheck size={12} className={currentBranding.color} /> 
                <span className="opacity-40">NODE_AUTH:</span> 
                <span className={cn("font-mono", currentBranding.color)}>{session.role.toUpperCase()}</span>
             </div>
             
             <BlurText 
                text={(t[currentBranding.titleKey] as string).toUpperCase()} 
                className="font-display text-5xl md:text-7xl font-bold tracking-tighter text-foreground" 
                delay={50} 
             />
             
             <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm font-light opacity-50 italic">
                   <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                   {session.email}
                </div>
                <div className="h-1 w-1 rounded-full bg-border" />
                <div className="text-[9px] font-mono font-bold text-primary uppercase tracking-widest">
                   ID_TRACE: {traceId}
                </div>
             </div>
           </div>
           
           <button className="flex items-center gap-4 px-10 py-5 rounded-full bg-red-500/5 border border-red-500/10 text-red-500/60 font-bold text-[10px] uppercase tracking-[0.4em] transition-all hover:bg-red-500 hover:text-white active:scale-95 shadow-xl">
             <LogOut size={16} /> {t.cta_logout}
           </button>

           <div className={cn("absolute -top-20 -right-20 h-64 w-64 blur-[120px] rounded-full opacity-10 transition-colors duration-1000", currentBranding.glow)} />
        </header>

        {/* --- 2. GRID DE TRABAJO (Multi-Silo) --- */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          <aside className="lg:col-span-3 space-y-12">
            {operationSilos.map((silo) => {
              const authorizedItems = silo.items.filter(item => 
                !item.roles || (item.roles as string[]).includes(session.role)
              );

              if (authorizedItems.length === 0) return null;

              return (
                <div key={silo.group} className="space-y-4">
                  <h4 className="px-6 text-[9px] font-bold text-muted-foreground uppercase tracking-[0.5em] opacity-40">
                    {silo.group}
                  </h4>
                  <nav className="space-y-1">
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
                        {activeView === 'overview' && nav.id === 'overview' && (
                           <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        )}
                      </Link>
                    ))}
                  </nav>
                </div>
              );
            })}
          </aside>

          <div className="lg:col-span-9 min-h-[650px] relative">
            <div className="absolute inset-0 bg-surface/5 border border-border/40 rounded-[4rem] -z-10" />
            
            <div
              key={activeView}
              className="animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both p-2"
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
                <div className="py-48 text-center space-y-8">
                   <Settings size={64} className="mx-auto text-muted-foreground/20 animate-spin-slow" />
                   <p className="text-xs font-mono text-muted-foreground uppercase tracking-[0.5em]">Configuration Node Standby</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 opacity-20 pointer-events-none">
         <span className="text-[7px] font-mono uppercase tracking-[1em] text-foreground">
           MetaShark Sovereign Portal v28.0
         </span>
      </div>
    </main>
  );
}