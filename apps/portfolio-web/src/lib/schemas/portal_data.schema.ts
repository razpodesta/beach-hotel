/**
 * @file portal_data.schema.ts
 * @description Constitución de datos para el Dashboard Unificado.
 *              Exportación de contratos para tipado estricto en la UI.
 * @version 1.1 - Tipo Reservation Exportado
 * @author Raz Podestá - MetaShark Tech
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

// @fix TS2305: Exportación explícita del tipo para que GuestReservationCard pueda importarlo
export type Reservation = z.infer<typeof reservationSchema>;

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

/** TIPO SOBERANO INFERIDO */
export type PortalData = z.infer<typeof portalDataSchema>;