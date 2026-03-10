// RUTA: /packages/testing-utils/src/lib/mocks/handlers.ts
// VERSIÓN: 1.1 - Limpio y Preparado
// DESCRIPCIÓN: Se elimina la importación no utilizada de 'http' para resolver
//              el error de build TS6133 y mantener la pureza del código.

// import { http } from 'msw'; // <-- LÍNEA ELIMINADA

export const handlers = [
  // Ejemplo de un handler que se podría añadir en el futuro:
  // http.post('http://localhost:4000/graphql', () => {
  //   return HttpResponse.json({ data: { getApps: [] } })
  // })
];
