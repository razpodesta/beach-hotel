// RUTA: apps/portfolio-web/src/app/api/visitor/route.ts
// VERSIÓN: 3.0 - Fail-Safe & Simulation Mode
// DESCRIPCIÓN: Implementa un mecanismo de defensa robusto. Si las APIs externas
//              (ip-api o open-meteo) fallan o exceden el tiempo de espera,
//              se devuelve un conjunto de datos "fallback" para garantizar que
//              la UI del VisitorHud siempre funcione y se vea espectacular.

import { NextResponse, type NextRequest } from 'next/server';

// Configuración de tiempos límite para evitar que la UI se quede "cargando" eternamente
const API_TIMEOUT_MS = 3000; // 3 segundos máximo para esperar a las APIs

// Datos de respaldo (Florianópolis, HQ de MetaShark) para el Modo Simulación
const FALLBACK_DATA = {
  city: 'Florianópolis',
  coordinates: {
    latitude: -27.5969,
    longitude: -48.5495,
  },
  timezone: 'America/Sao_Paulo',
  weather: {
    temperature: 24,
    weathercode: 1, // Despejado/Soleado
  },
  ip: 'SIMULATION_MODE',
};

// Helper para añadir timeout a fetch
const fetchWithTimeout = async (url: string, options: RequestInit = {}) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

export async function GET(request: NextRequest) {
  try {
    // 1. Detección de IP
    let ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    if (ip === '::1' || ip === '127.0.0.1') {
      ip = ''; // ip-api usa la IP del solicitante
    }

    // 2. Consulta Geo (con Timeout)
    const geoRes = await fetchWithTimeout(`http://ip-api.com/json/${ip}?fields=status,city,lat,lon,timezone,query`);

    if (!geoRes.ok) throw new Error('Geo API Network Error');
    const geoData = await geoRes.json();

    if (geoData.status !== 'success') {
      // Si falla la geolocalización, lanzamos error para activar el fallback
      throw new Error('Geo API returned error status');
    }

    // 3. Consulta Clima (con Timeout)
    const weatherRes = await fetchWithTimeout(
      `https://api.open-meteo.com/v1/forecast?latitude=${geoData.lat}&longitude=${geoData.lon}&current_weather=true`
    );

    if (!weatherRes.ok) throw new Error('Weather API Network Error');
    const weatherData = await weatherRes.json();

    // 4. Respuesta Exitosa Real
    const payload = {
      city: geoData.city,
      coordinates: {
        latitude: geoData.lat,
        longitude: geoData.lon,
      },
      timezone: geoData.timezone,
      weather: {
        temperature: Math.round(weatherData.current_weather?.temperature || 0),
        weathercode: weatherData.current_weather?.weathercode || 0,
      },
      ip: geoData.query,
    };

    return NextResponse.json(payload);

  } catch (error) {
    // 5. Manejo de Errores (FALLBACK SYSTEM)
    // En lugar de romper la UI con un 500, devolvemos datos simulados.
    // Esto es preferible para un portafolio que debe verse siempre bien.
    console.warn('[API/Visitor] API externa falló o tardó demasiado. Activando Modo Simulación.', error);

    return NextResponse.json(FALLBACK_DATA, {
      status: 200, // Respondemos con 200 OK para que el cliente renderice
      headers: {
        'X-Visitor-Status': 'Simulation', // Header informativo
      }
    });
  }
}
