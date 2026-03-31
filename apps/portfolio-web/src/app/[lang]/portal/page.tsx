/**
 * @file apps/portfolio-web/src/app/[lang]/portal/page.tsx
 * @description Orquestador Soberano del Dashboard Unificado.
 *              Refactorizado: Erradicación de non-null assertions, blindaje de
 *              infraestructura Supabase y sincronización de identidad en producción.
 * @version 10.0 - Zero Non-Null Assertion & Production Hardened
 * @author Raz Podestá - MetaShark Tech
 */

import React from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getPayload } from 'payload';
import configPromise from '@metashark/cms-core/config';
import { createServerClient } from '@supabase/ssr';
import { 
  Terminal, Hotel, Briefcase, User, Settings, LogOut, 
  Activity, ShieldCheck, LayoutGrid, Sparkles 
} from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA
 * @pilar V: Adherencia arquitectónica.
 */
import { getDictionary } from '../../../lib/get-dictionary';
import { type Locale } from '../../../config/i18n.config';
import { BlurText } from '../../../components/razBits/BlurText';
import { FadeIn } from '../../../components/ui/FadeIn';
import { cn } from '../../../lib/utils/cn';
import { getPortalData } from '../../../lib/portal-api';

/**
 * APARATOS DE VISTA
 */
import { AdminMediaPanel } from '../../../components/sections/portal/AdminMediaPanel';
import { InventoryExplorer } from '../../../components/sections/portal/media/InventoryExplorer';
import { ArtifactShowcase } from '../../../components/sections/portal/ArtifactShowcase';

/**
 * IMPORTACIONES DE CONTRATO (SSoT)
 */
import type { SovereignRole } from '../../../lib/route-guard';
import type { PortalDictionary } from '../../../lib/schemas/portal.schema';
import { shapeMediaEntity, type SovereignMedia } from '../../../lib/portal';
import type { PayloadMediaDoc } from '@metashark/cms-core';

interface RoleBrandingConfig {
  color: string;
  glow: string;
  icon: typeof Terminal;
  title: string;
}

interface SovereignSessionData {
  userId: string;
  role: SovereignRole;
  email: string;
  tenantId: string | null;
  xp: number;
  artifacts: string[];
}

/**
 * RESOLVER DE SESIÓN SOBERANA (Production Mode)
 * @description Handshake criptográfico con Supabase y sincronización con CMS.
 * @pilar III: Seguridad de Tipos. Eliminación de assertions '!'.
 */
async function getActiveSession(): Promise<SovereignSessionData | null> {
  // 1. Bypass de Desarrollo (Ghost Mode)
  if (process.env.NEXT_PUBLIC_AUTH_BYPASS === 'true') {
    return { 
      userId: 'GHOST_ADMIN_S0', 
      role: 'developer', 
      email: 'dev-mode@metashark.tech', 
      tenantId: '00000000-0000-0000-0000-000000000001',
      xp: 3300,
      artifacts: ['monolito-obsidiana', 'martillo-thorvalds', 'terminal-fantasma', 'entidad-ia']
    };
  }

  // 2. Validación de Bóveda de Entorno
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[HEIMDALL][CRITICAL] Infrastructure failure: Missing Supabase Credentials.');
    return null;
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // 3. Sincronización con el Clúster de Identidad del CMS
  try {
    const payload = await getPayload({ config: await configPromise });
    const { docs: userDocs } = await payload.find({
      collection: 'users',
      where: { email: { equals: user.email ?? '' } },
      limit: 1
    });

    const profile = userDocs[0];

    return {
      userId: user.id,
      role: (profile?.role as SovereignRole) || 'guest',
      email: user.email ?? 'anonymous@santuario.com',
      tenantId: profile?.tenantId || null,
      xp: profile?.experiencePoints || 0,
      artifacts: profile?.level ? ['monolito-obsidiana'] : [] 
    };
  } catch (error) {
    console.error('[HEIMDALL][DB-SYNC] Identity linkage failed:', error);
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
  return { title: `${dict.portal.nav_overview} | Sanctuary Portal` };
}

/**
 * APARATO PRINCIPAL: PortalPage
 */
export default async function PortalPage(props: PageProps) {
  const { lang } = await props.params;
  const { view } = await props.searchParams;
  
  const activeView = view || 'overview';
  const session = await getActiveSession();

  if (!session) redirect(`/${lang}/login`);

  /**
   * ORQUESTACIÓN PARALELA DE RECURSOS (Pilar X)
   */
  const [dict, data, mediaDocs] = await Promise.all([
    getDictionary(lang),
    getPortalData(session.role, session.userId),
    (async () => {
      const isStaff = session.role === 'admin' || session.role === 'developer';
      if (activeView === 'inventory' && isStaff) {
        const payload = await getPayload({ config: await configPromise });
        const result = await payload.find({
          collection: 'media',
          where: session.tenantId ? { tenantId: { equals: session.tenantId } } : {},
          limit: 100,
          sort: '-createdAt'
        });
        return result.docs;
      }
      return [];
    })()
  ]);

  const t: PortalDictionary = dict.portal;
  const role: SovereignRole = session.role;

  const BRANDING_MAP: Record<SovereignRole, RoleBrandingConfig> = {
    developer: { color: 'text-purple-400', glow: 'bg-purple-500', icon: Terminal, title: t.welcome_developer },
    admin: { color: 'text-blue-400', glow: 'bg-blue-500', icon: Hotel, title: t.welcome_admin },
    operator: { color: 'text-emerald-400', glow: 'bg-emerald-500', icon: Briefcase, title: t.welcome_operator },
    sponsor: { color: 'text-yellow-400', glow: 'bg-yellow-500', icon: ShieldCheck, title: t.welcome_guest },
    guest: { color: 'text-pink-400', glow: 'bg-pink-500', icon: User, title: t.welcome_guest },
    anonymous: { color: 'text-zinc-400', glow: 'bg-zinc-500', icon: User, title: t.welcome_guest }
  };

  const branding = BRANDING_MAP[role];
  const Icon = branding.icon;

  const mediaItems: SovereignMedia[] = mediaDocs.map(doc => shapeMediaEntity(doc as unknown as PayloadMediaDoc));

  return (
    <main className="min-h-screen bg-background text-foreground pt-32 pb-24 selection:bg-primary/30 transition-colors duration-1000">
      <div className="container mx-auto px-6">
        
        {/* --- 1. HEADER DE IDENTIDAD SOBERANA --- */}
        <header className="mb-20 flex flex-col md:flex-row items-start md:items-end justify-between gap-8 border-b border-border/50 pb-12">
          <div className="space-y-6">
            <FadeIn delay={0.1}>
              <div className={cn("inline-flex items-center gap-3 font-mono text-[10px] font-bold uppercase tracking-[0.4em]", branding.color)}>
                <div className="relative flex h-2 w-2">
                  <div className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75", branding.glow)} />
                  <div className={cn("relative inline-flex h-2 w-2 rounded-full", branding.glow)} />
                </div>
                {t.status_active_session} • {role.toUpperCase()}
              </div>
            </FadeIn>
            
            <BlurText 
              text={branding.title.toUpperCase()} 
              className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-foreground" 
              delay={50}
            />
            
            <p className="text-muted-foreground text-sm md:text-base font-sans italic opacity-60">
              {session.email} • {t.last_sync_label}: {new Date().toLocaleTimeString()}
            </p>
          </div>

          <div className="flex gap-4">
            <button className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-surface border border-border hover:border-primary/40 transition-all text-[10px] font-bold uppercase tracking-widest outline-none">
              <Settings size={14} /> {t.cta_settings}
            </button>
            <button className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest outline-none">
              <LogOut size={14} /> {t.cta_logout}
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          
          <aside className="md:col-span-3 space-y-2">
            {[
              { id: 'overview', label: t.nav_overview, icon: Activity, roles: null },
              { id: 'inventory', label: t.nav_inventory, icon: LayoutGrid, roles: ['admin', 'developer'] },
              { id: 'reservations', label: t.nav_reservations, icon: Hotel, roles: ['admin', 'guest', 'sponsor'] },
              { id: 'b2b', label: t.nav_b2b_rates, icon: Briefcase, roles: ['operator', 'developer'] },
              { id: 'telemetry', label: t.nav_telemetry, icon: Terminal, roles: ['developer'] },
            ].map((nav) => {
              if (nav.roles && !nav.roles.includes(role)) return null;
              const isActive = activeView === 'overview' ? nav.id === 'overview' : activeView === nav.id;

              return (
                <Link 
                  key={nav.id}
                  href={`/${lang}/portal?view=${nav.id}`}
                  className={cn(
                    "w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all",
                    isActive 
                      ? "bg-primary text-white shadow-xl translate-x-2" 
                      : "hover:bg-surface text-muted-foreground hover:text-foreground"
                  )}
                >
                  <nav.icon size={16} /> {nav.label}
                </Link>
              );
            })}
          </aside>

          <div className="md:col-span-9 space-y-16">
            
            {activeView === 'overview' && (
              <FadeIn delay={0.2} className="space-y-12">
                 <header className="px-4">
                    <div className="flex items-center gap-3 text-primary mb-4">
                       <Sparkles size={18} className="animate-pulse" />
                       <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Protocol 33 Active Scan</span>
                    </div>
                    <h3 className="font-display text-4xl font-bold text-foreground tracking-tighter uppercase">
                       {dict.gamification.artifacts_title}
                    </h3>
                 </header>
                 
                 <ArtifactShowcase 
                    userXp={session.xp} 
                    ownedIds={session.artifacts} 
                    dictionary={dict.gamification} 
                 />
              </FadeIn>
            )}

            {activeView === 'inventory' && (role === 'admin' || role === 'developer') && (
              <FadeIn delay={0.2} className="space-y-16">
                 <AdminMediaPanel mediaLabels={dict.admin_media} />
                 
                 <div className="pt-12 border-t border-border/50">
                   <div className="mb-10 px-4">
                      <h3 className="font-display text-2xl font-bold text-foreground uppercase tracking-tight">Bóveda Cloud S3</h3>
                      <p className="text-muted-foreground text-sm font-sans italic opacity-60">Gestão atômica de ativos vinculada ao seu identificador soberano.</p>
                   </div>
                   <InventoryExplorer items={mediaItems} dictionary={dict.admin_media} />
                 </div>
              </FadeIn>
            )}

            {(activeView === 'reservations' || (activeView === 'inventory' && role === 'guest')) && (
              <FadeIn key="default-view" delay={0.2}>
                <div className="min-h-[500px] rounded-[3.5rem] border border-border bg-surface/30 backdrop-blur-md p-12 flex flex-col items-center justify-center text-center">
                   <div className="relative mb-8">
                      <div className={cn("absolute -inset-8 blur-3xl rounded-full opacity-10", branding.glow)} />
                      <Icon size={64} className={cn("relative", branding.color)} strokeWidth={1} />
                   </div>
                   
                   <h3 className="font-display text-2xl font-bold mb-4 uppercase tracking-tight">
                      {data.notifications[0]?.message || t.empty_data_label}
                   </h3>
                   <p className="text-muted-foreground max-w-xs mx-auto text-sm leading-relaxed font-sans italic opacity-40">
                      Sincronizando com os clusters MetaShark. Sua experiência boutique está sendo processada.
                   </p>
                </div>
              </FadeIn>
            )}
          </div>
        </section>
      </div>

      <div className={cn(
        "fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,var(--color-primary),transparent_70%)] pointer-events-none opacity-[0.03]",
      )} />
    </main>
  );
}