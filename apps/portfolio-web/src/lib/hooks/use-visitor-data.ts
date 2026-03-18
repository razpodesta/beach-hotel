/**
 * @file use-visitor-data.ts
 * @description Hook soberano de telemetría. Gestiona la recuperación de datos 
 *              geográficos, climáticos (WMO) y de red del visitante.
 *              Implementa cancelación de peticiones para evitar fugas de memoria.
 * @version 5.0 - Network Resilience & Abort Protocol
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import { useState, useEffect } from 'react';

/**
 * @interface VisitorData
 * @description Estructura de datos inmutable del visitante.
 */
export interface VisitorData {
  /** Ciudad detectada por GeoIP */
  city: string;
  /** Coordenadas geográficas precisas */
  coordinates: {
    latitude: number;
    longitude: number;
  };
  /** Zona horaria para sincronización de reloj */
  timezone: string;
  /** Datos meteorológicos actuales */
  weather: {
    temperature: number;
    /** Código de clima WMO (0: Despejado, 1-3: Nublado, >3: Lluvia/Nieve) */
    weathercode: number;
  };
  /** Dirección IP de origen */
  ip: string;
}

/**
 * @interface VisitorState
 * @description Estado interno del hook para gestión de UI.
 */
interface VisitorState {
  data: VisitorData | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * HOOK: useVisitorData
 * @returns {VisitorState} Estado de telemetría en tiempo real.
 */
export function useVisitorData(): VisitorState {
  const [state, setState] = useState<VisitorState>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    /**
     * @pilar VIII: Resiliencia de Red.
     * El AbortController permite cancelar la petición si el componente se desmonta,
     * evitando actualizaciones de estado en componentes inexistentes.
     */
    const controller = new AbortController();
    const { signal } = controller;

    const fetchVisitorData = async () => {
      // Protocolo Heimdall: Trazabilidad de inicio de petición
      console.group('[HEIMDALL][TELEMETRY] Fetching Visitor Data');
      
      try {
        const response = await fetch('/api/visitor', { signal });

        if (!response.ok) {
          throw new Error(`HTTP_ERROR: ${response.status}`);
        }

        const jsonData = await response.json();

        if (jsonData.error) {
          throw new Error(jsonData.error);
        }

        console.log('[DATA] Payload received successfully:', jsonData.city);
        
        setState({
          data: jsonData as VisitorData,
          isLoading: false,
          error: null,
        });

      } catch (err: unknown) {
        // Ignoramos errores causados por la cancelación manual de la petición
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('[INFO] Fetch aborted safely.');
          return;
        }

        const errorMessage = err instanceof Error ? err.message : 'UNKNOWN_ERROR';
        console.error('[CRITICAL] Telemetry synchronization failed:', errorMessage);

        setState({
          data: null,
          isLoading: false,
          error: 'DATA_UNAVAILABLE',
        });
      } finally {
        console.groupEnd();
      }
    };

    fetchVisitorData();

    // Función de limpieza: El "Teardown" del aparato
    return () => {
      controller.abort();
    };
  }, []);

  return state;
}