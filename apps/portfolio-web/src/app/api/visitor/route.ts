/**
 * @file apps/portfolio-web/src/app/api/visitor/route.ts
 * @description API de telemetría de visitante (Heimdall).
 *              Orquesta la recuperación de geolocalización y clima con 
 *              resiliencia de grado militar y detección de entorno local.
 * @version 5.0 - Type-Safe & Build-Optimized
 * @author Raz Podestá - MetaShark Tech
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * CONFIGURACIÓN DE SEGMENTO
 * @pilar X: Rendimiento. Evita el cacheo estático de datos de usuario.
 */
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const API_TIMEOUT_MS = 2500;

/**
 * CONTRATOS DE RESPUESTA EXTERNA
 */
interface IpApiResponse {
  status: 'success' | 'fail';
  city: string;
  lat: number;
  lon: number;
  timezone: string;
  query: string; // IP
}

interface OpenMeteoResponse {
  current_weather?: {
    temperature: number;
    weathercode: number;
  };
}

const FALLBACK_DATA = {
  city: 'Florianópolis',
  coordinates: { latitude: -27.5969, longitude: -48.5495 },
  timezone: 'America/Sao_Paulo',
  weather: { temperature: 24, weathercode: 1 },
  ip: 'LOCAL_INFRASTRUCTURE',
};

/**
 * APARATO PRINCIPAL: GET
 * @description Punto de entrada para el Visitor HUD.
 */
export async function GET(request: NextRequest) {
  const controller = new AbortController();
  const signal = controller.signal;

  try {
    // 1. RESOLUCIÓN DE IDENTIDAD DE RED
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : '127.0.0.1';

    // 2. GUARDIA DE ENTORNO LOCAL (Optimización de Build)
    if (ip === '127.0.0.1' || ip === '::1' || ip.includes('localhost')) {
      return NextResponse.json({ ...FALLBACK_DATA, status: 'Local_Dev' });
    }

    // 3. ORQUESTACIÓN DE GEOLOCALIZACIÓN
    // Usamos el servicio JSON de ip-api (Nota: HTTPS requiere plan pro, se maneja vía servidor)
    const geoPromise = fetch(`http://ip-api.com/json/${ip}?fields=status,city,lat,lon,timezone,query`, { 
      signal,
      next: { revalidate: 3600 } // Cacheo inteligente por 1 hora
    });
    
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('TIMEOUT')), API_TIMEOUT_MS)
    );

    const geoRes = await (Promise.race([geoPromise, timeoutPromise]) as Promise<Response>);

    if (!geoRes.ok) throw new Error('GEO_FETCH_FAILED');
    
    const geoData = (await geoRes.json()) as IpApiResponse;
    if (geoData.status !== 'success') throw new Error('IP_NOT_FOUND');

    // 4. ORQUESTACIÓN METEOROLÓGICA (WMO Standard)
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${geoData.lat}&longitude=${geoData.lon}&current_weather=true`,
      { signal }
    );
    
    const weatherData = (await weatherRes.json()) as OpenMeteoResponse;

    // 5. RESPUESTA SOBERANA SINCRONIZADA
    return NextResponse.json({
      city: geoData.city,
      coordinates: { latitude: geoData.lat, longitude: geoData.lon },
      timezone: geoData.timezone,
      weather: {
        temperature: Math.round(weatherData.current_weather?.temperature ?? 24),
        weathercode: weatherData.current_weather?.weathercode ?? 0,
      },
      ip: geoData.query,
    }, {
      status: 200,
      headers: {
        'X-Heimdall-Status': 'Synchronized',
        'Cache-Control': 'no-store, max-age=0'
      }
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'UNKNOWN_EXCEPTION';
    console.warn(`[HEIMDALL][TELEMETRY] Fallback activado. Motivo: ${msg}`);

    // Mantenemos el silencio en consola de producción pero reportamos el estado en cabeceras
    return NextResponse.json(FALLBACK_DATA, {
      status: 200,
      headers: { 
        'X-Heimdall-Status': 'Simulation',
        'X-Heimdall-Reason': msg
      }
    });
  } finally {
    controller.abort();
  }
}