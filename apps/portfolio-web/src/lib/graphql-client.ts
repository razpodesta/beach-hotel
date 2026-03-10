// RUTA: apps/portfolio-web/src/lib/graphql-client.ts
// VERSIÓN: 9.0 - Producción Estricta (Payload CMS 3.0 Ready)
// DESCRIPCIÓN: Comunicación directa con Payload CMS.
//              Eliminamos la lógica de mocks de la fachada principal.

type GraphQLResponse<T> = {
  data: T;
  errors?: Array<{ message: string }>;
};

/**
 * Cliente de GraphQL optimizado para Payload CMS 3.0.
 * Utiliza fetch nativo con revalidación de Next.js.
 */
export async function fetchGraphQL<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const endpoint = process.env.CMS_GRAPHQL_ENDPOINT;

  if (!endpoint) {
    throw new Error('CRITICAL CONFIG ERROR: CMS_GRAPHQL_ENDPOINT is not defined.');
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        // Si tienes auth token para Payload, se añadiría aquí
      },
      body: JSON.stringify({ query, variables }),
      next: { 
        revalidate: 60, // ISR: Actualiza datos cada 60s
        tags: ['cms-data'] 
      },
    });

    if (!response.ok) {
      throw new Error(`Payload CMS responded with status: ${response.status}`);
    }

    const json: GraphQLResponse<T> = await response.json();

    if (json.errors) {
      console.error('[GraphQL Errors]:', json.errors);
      throw new Error('Failed to fetch from Payload CMS.');
    }

    return json.data;

  } catch (error) {
    console.error('[GraphQL Client Error]:', error);
    throw error; // Propagamos el error para que Next.js muestre la página de error
  }
}