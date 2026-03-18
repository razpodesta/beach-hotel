/**
 * @file apps/portfolio-web/src/app/api/visitor/route.ts
 * @description API de telemetría de visitante (Heimdall).
 *              Implementa resiliencia de red con fallback determinista.
 *              Refactorizada para evitar ruido en consola y optimizar tiempos.
 * @version 4.0 - Silent Resilience Edition
 * @author Raz Podestá - MetaShark Tech
 */

import { NextResponse, type NextRequest } from 'next/server';

const API_TIMEOUT_MS = 2500;

const FALLBACK_DATA = {
  city: 'Florianópolis',
  coordinates: { latitude: -27.5969, longitude: -48.5495 },
  timezone: 'America/Sao_Paulo',
  weather: { temperature: 24, weathercode: 1 },
  ip: 'SIMULATION_MODE',
};

/**
 * @pilar IV: Telemetría Forense.
 * Solo logueamos si es necesario, evitando basura en la consola de desarrollo.
 */
export async function GET(request: NextRequest) {
  const controller = new AbortController();
  const signal = controller.signal;

  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '';
    
    // Ejecución optimizada en paralelo
    const geoPromise = fetch(`http://ip-api.com/json/${ip}?fields=status,city,lat,lon,timezone,query`, { signal });
    
    // Timeout nativo de fetch
    const geoRes = await Promise.race([
      geoPromise,
      new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), API_TIMEOUT_MS))
    ]);

    if (!geoRes.ok) throw new Error('Geo API Error');
    const geoData = await geoRes.json();

    if (geoData.status !== 'success') throw new Error('Geo Invalid');

    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${geoData.lat}&longitude=${geoData.lon}&current_weather=true`,
      { signal }
    );
    const weatherData = await weatherRes.json();

    return NextResponse.json({
      city: geoData.city,
      coordinates: { latitude: geoData.lat, longitude: geoData.lon },
      timezone: geoData.timezone,
      weather: {
        temperature: Math.round(weatherData.current_weather?.temperature || 0),
        weathercode: weatherData.current_weather?.weathercode || 0,
      },
      ip: geoData.query,
    });

  } catch {
    // Modo Silencioso: Ante error de red o timeout, retornamos fallback sin inundar consola
    return NextResponse.json(FALLBACK_DATA, {
      status: 200,
      headers: { 'X-Visitor-Status': 'Simulation' }
    });
  } finally {
    controller.abort();
  }
}