/**
 * @file apps/portfolio-web/src/app/[lang]/portal/page.tsx
 * @description Enterprise Operations Portal (HopEx v4.0).
 *              Refactorizado: Resolución de TS2304/TS2339, limpieza de importaciones 
 *              y consolidación de diccionarios.
 * @version 23.2 - Production Inmaculate Edition
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
  Activity, LayoutGrid, type LucideIcon,
  Zap, Users, Send, Percent, QrCode, Database, Bell,
  ShieldCheck // <-- Restaurado: Esencial para el rol 'sponsor'
} from 'lucide-react';

/** IMPORTACIONES DE INFRAESTRUCTURA (SSoT) */
import { getDictionary } from '../../../lib/get-dictionary';
import { type Locale } from '../../../config/i18n.config';
import { BlurText } from '../../../components/razBits/BlurText';
import { cn } from '../../../lib/utils/cn';

/** OPERATIONAL MANAGERS */
import { AdminMediaPanel } from '../../../components/sections/portal/AdminMediaPanel';
import { ArtifactShowcase } from '../../../components/sections/portal/ArtifactShowcase';
import { IngestionManager } from '../../../components/sections/portal/IngestionManager';
import { PartnerManagement } from '../../../components/sections/portal/PartnerManagement';

/** IMPORTACIONES DE CONTRATO */
import type { EnterpriseRole } from '../../../lib/route-guard';
import type { AgencyEntity } from '../../../components/sections/portal/PartnerManagement';

type PartnerAgencies = AgencyEntity[];

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

async function getActiveEnterpriseSession(): Promise<EnterpriseSessionData | null> {
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

export default async function PortalPage(props: PageProps) {
  const { lang } = await props.params;
  const { view } = await props.searchParams;
  const activeView = view || 'overview';
  const session = await getActiveEnterpriseSession();

  if (!session) redirect(`/${lang}/login`);

  const [dict, partnerInventory] = await Promise.all([
    getDictionary(lang),
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
  
  const currentBranding: RoleBrandingConfig = {
    developer: { color: 'text-purple-400', glow: 'bg-purple-500', icon: Terminal, title: t.welcome_developer },
    admin: { color: 'text-blue-400', glow: 'bg-blue-500', icon: Hotel, title: t.welcome_admin },
    operator: { color: 'text-emerald-400', glow: 'bg-emerald-500', icon: Briefcase, title: t.welcome_operator },
    sponsor: { color: 'text-yellow-400', glow: 'bg-yellow-500', icon: ShieldCheck, title: t.welcome_guest },
    guest: { color: 'text-pink-400', glow: 'bg-pink-500', icon: User, title: t.welcome_guest },
    anonymous: { color: 'text-zinc-400', glow: 'bg-zinc-500', icon: User, title: t.welcome_guest }
  }[role];

  const operationSilos = [
    { group: "Core Operations", items: [{ id: 'overview', label: t.nav_overview, icon: Activity, roles: null }, { id: 'inventory', label: t.nav_inventory, icon: LayoutGrid, roles: ['admin', 'developer'] }] },
    { group: "Silo A", items: [{ id: 'offers-flash', label: dict.offers_flash.title, icon: Zap, roles: ['admin', 'developer'] }, { id: 'offers-enterprise', label: 'B2B/Wholesale', icon: Percent, roles: ['admin', 'developer', 'operator'] }] },
    { group: "Silo B", items: [{ id: 'partner-hub', label: dict.partner_network.title, icon: Users, roles: ['admin', 'developer', 'operator'] }, { id: 'partner-onboarding', label: dict.partner_network.agent_management.add_agent, icon: QrCode, roles: ['admin', 'developer'] }] },
    { group: "Silo C", items: [{ id: 'data-pipeline', label: dict.ingestion_vault.title, icon: Database, roles: ['admin', 'developer'] }, { id: 'marketing-cloud', label: dict.marketing_cloud.title, icon: Send, roles: ['admin', 'developer'] }] },
    { group: "Silo D", items: [{ id: 'comms-hub', label: dict.comms_hub.title, icon: Bell, roles: null }, { id: 'settings', label: t.cta_settings, icon: Settings, roles: null }] }
  ];

  return (
    <main className="min-h-screen bg-background text-foreground pt-32 pb-24">
      <div className="container mx-auto px-6">
        <header className="mb-20 flex flex-col md:flex-row items-start justify-between border-b border-border/50 pb-12">
           <div className="space-y-6">
             <BlurText text={currentBranding.title.toUpperCase()} className="font-display text-5xl font-bold tracking-tighter" delay={50} />
             <p className="text-sm font-light opacity-60 italic">{session.email}</p>
           </div>
           <button className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 transition-all hover:bg-red-500 hover:text-white">
             <LogOut size={16} /> {t.cta_logout}
           </button>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <aside className="md:col-span-3 space-y-10">
            {operationSilos.map((silo) => (
              <div key={silo.group} className="space-y-3">
                <h4 className="px-4 text-[9px] font-bold text-muted-foreground uppercase tracking-[0.4em]">{silo.group}</h4>
                {silo.items.map((nav) => (
                  <Link key={nav.id} href={`/${lang}/portal?view=${nav.id}`} className={cn("block px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest", activeView === nav.id ? "bg-primary text-white" : "hover:bg-surface")}>
                    <nav.icon size={16} className="inline mr-3" /> {nav.label}
                  </Link>
                ))}
              </div>
            ))}
          </aside>

          <div className="md:col-span-9">
            {activeView === 'overview' && <ArtifactShowcase userXp={session.xp} ownedIds={session.artifacts} dictionary={dict.gamification} />}
            {activeView === 'inventory' && <AdminMediaPanel mediaLabels={dict.admin_media} />}
            {activeView === 'data-pipeline' && <IngestionManager dictionary={dict.ingestion_vault} />}
            {activeView === 'partner-hub' && <PartnerManagement agencies={partnerInventory as unknown as PartnerAgencies} dictionary={dict.partner_network} />}
          </div>
        </section>
      </div>
    </main>
  );
}