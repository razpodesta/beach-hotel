/**
 * @file GuestReservationCard.tsx
 * @description Aparato de gestión de estancias para el Huésped Soberano.
 *              Refactorizado: Saneamiento de rutas (Nx Frontiers), 
 *              erradicación de importaciones huérfanas y tipado estricto.
 * @version 2.1 - Architecture Boundary Compliance
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  QrCode, 
  ArrowRight, 
  Clock,
  Key
} from 'lucide-react';

/**
 * IMPORTACIONES DE INFRAESTRUCTRURA (Nx Relative Path Compliance)
 */
import { cn } from '../../../lib/utils/cn';
import { type Locale } from '../../../config/i18n.config';
import type { Reservation } from '../../../lib/schemas/portal_data.schema';
import type { PortalDictionary } from '../../../lib/schemas/portal.schema';

interface GuestReservationCardProps {
  reservation: Reservation;
  t: PortalDictionary;
  lang: Locale;
  className?: string;
}

export function GuestReservationCard({ reservation, t, lang, className }: GuestReservationCardProps) {
  
  const atmosphere = useMemo(() => {
    switch (reservation.status) {
      case 'confirmed': 
        return { color: 'text-success', glow: 'bg-success', label: t.label_metric_nominal, border: 'border-success/20' };
      case 'pending': 
        return { color: 'text-yellow-500', glow: 'bg-yellow-500', label: t.label_metric_warning, border: 'border-yellow-500/20' };
      default: 
        return { color: 'text-primary', glow: 'bg-primary', label: t.label_metric_nominal, border: 'border-primary/20' };
    }
  }, [reservation.status, t]);

  const dateRange = useMemo(() => {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' };
    const start = new Intl.DateTimeFormat(lang, options).format(new Date(reservation.checkIn));
    const end = new Intl.DateTimeFormat(lang, options).format(new Date(reservation.checkOut));
    const year = new Date(reservation.checkIn).getFullYear();
    return { start, end, year };
  }, [reservation.checkIn, reservation.checkOut, lang]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[3.5rem] border bg-surface/30 backdrop-blur-xl transition-all duration-700",
        "hover:shadow-3xl transform-gpu border-border",
        atmosphere.border,
        className
      )}
    >
      <div className="relative h-64 w-full overflow-hidden bg-background">
        <Image
          src={`/images/suites/suite-master-alpha.jpg`}
          alt={reservation.suiteName}
          fill
          className="object-cover transition-transform duration-2000 group-hover:scale-110"
          sizes="400px"
        />
        
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/20 to-transparent opacity-90" />
        
        <div className="absolute top-8 left-8 z-20">
          <span className={cn(
            "inline-flex items-center gap-2 rounded-full backdrop-blur-3xl border px-5 py-2 text-[9px] font-bold uppercase tracking-[0.25em] bg-background/60",
            atmosphere.color,
            atmosphere.border
          )}>
            <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", atmosphere.glow)} />
            {atmosphere.label}
          </span>
        </div>
      </div>

      <div className="flex grow flex-col p-10 md:p-12 relative z-10">
        <div className="mb-8 flex items-center gap-6 text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
          <div className="flex items-center gap-2.5">
            <Calendar size={14} className="text-primary" /> 
            <span>{dateRange.start} — {dateRange.end}, {dateRange.year}</span>
          </div>
        </div>

        <h3 className="font-display text-3xl font-bold leading-none text-foreground mb-4 tracking-tighter transition-colors group-hover:text-primary">
          {reservation.suiteName}
        </h3>
        
        <div className="flex items-center gap-3 text-xs text-muted-foreground italic mb-10">
           <MapPin size={14} className="opacity-40" />
           <span>Av. das Nações, 1140 • Florianópolis</span>
        </div>

        <div className="space-y-4 pt-4 border-t border-border/50">
           <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              <span className="flex items-center gap-2"><Clock size={12} /> {t.last_sync_label}</span>
              <span className="text-foreground">Check-in: 14:00</span>
           </div>
           <div className="relative h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '45%' }}
                className={cn("h-full", atmosphere.glow)}
              />
           </div>
        </div>
      </div>

      <footer className="relative z-30 border-t border-border/50 p-10 bg-surface/50 flex items-center justify-between">
        <button className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-[0.4em] text-foreground hover:text-primary transition-all group/btn">
          <Key size={16} className="opacity-40 group-hover/btn:rotate-12 transition-transform" />
          {t.nav_inventory.split(' ')[0]} Key 
          <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-2" />
        </button>
        
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-background border border-border shadow-xl text-foreground/20 group-hover:text-primary group-hover:border-primary/40 transition-all cursor-pointer">
           <QrCode size={24} strokeWidth={1.5} />
        </div>
      </footer>
    </motion.article>
  );
}