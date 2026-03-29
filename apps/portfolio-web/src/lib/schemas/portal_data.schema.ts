/**
 * @file portal_data.schema.ts
 * @description Constitución de datos para el Dashboard Unificado.
 *              Define los contratos de telemetría, reservas y tarifas netas.
 * @version 1.0 - Multi-Role Data Contracts
 */

import { z } from 'zod';

/** 1. Dominios de Datos Atómicos */
export const reservationSchema = z.object({
  id: z.string().uuid(),
  suiteName: z.string(),
  checkIn: z.string().datetime(),
  checkOut: z.string().datetime(),
  status: z.enum(['confirmed', 'pending', 'cancelled']),
});

export const telemetryMetricSchema = z.object({
  label: z.string(),
  value: z.number(),
  unit: z.string(),
  status: z.enum(['nominal', 'warning', 'critical']),
});

/** 2. Respuestas Polimórficas por Rol */
export const portalDataSchema = z.object({
  // Datos comunes para todos los roles
  notifications: z.array(z.object({
    id: z.string(),
    message: z.string(),
    type: z.enum(['info', 'alert', 'reward']),
  })),

  // Datos específicos condicionales
  guestData: z.object({
    reservations: z.array(reservationSchema),
    loyaltyPoints: z.number(),
  }).optional(),

  developerData: z.object({
    serverHealth: z.array(telemetryMetricSchema),
    activeConnections: z.number(),
  }).optional(),

  operatorData: z.object({
    activeAllocations: z.number(),
    netRateYield: z.string(),
  }).optional(),
});

export type PortalData = z.infer<typeof portalDataSchema>;