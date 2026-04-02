/**
 * @file types.ts
 * @description Contratos de datos para el Silo B.
 *              Centraliza las definiciones para eliminar dependencias circulares.
 */
import { type LucideIcon } from 'lucide-react';

export interface AgencyEntity {
  id: string;
  brandName: string;
  jurisdiction: 'BR' | 'CL' | 'AR' | 'US' | 'INTL';
  taxId: string;
  iataCode?: string;
  trustScore: number;
  status: 'active' | 'review' | 'blocked';
  totalYield: number;
  pendingCommission: number;
  logoUrl?: string;
}

export interface StatusConfig {
  icon: LucideIcon;
  color: string;
  bg: string;
  label: string;
}