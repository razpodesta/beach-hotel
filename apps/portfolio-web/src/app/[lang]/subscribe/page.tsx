// RUTA: apps/portfolio-web/src/app/[lang]/subscribe/page.tsx
// VERSIÓN: 2.0 - Refactorizado para eliminar carga de datos no utilizados
// DESCRIPCIÓN: Esta página sirve como el punto de entrada para la suscripción
//              por email. Actualmente es un placeholder y se ha optimizado
//              para no realizar operaciones innecesarias (como cargar diccionarios)
//              hasta que el formulario real sea implementado.

// NOTA: Las importaciones de 'getDictionary' y 'Locale' han sido eliminadas
// ya que no se están utilizando, manteniendo el archivo lo más limpio posible.

// Este es un Server Component por defecto.
export default async function SubscribePage() {
  // La carga del diccionario ha sido eliminada.
  // Se reintroducirá cuando el componente del formulario real lo requiera.

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="container mx-auto py-20">
        <div className="mx-auto max-w-md text-center">
          <h1 className="font-display text-4xl font-bold text-white">
            Suscríbete
          </h1>
          <p className="mt-2 text-zinc-400">
            Ingresa tu email para unirte a la comunidad.
          </p>

          <div className="mt-8 rounded-lg border border-dashed border-zinc-700 p-8">
            <p className="text-sm text-zinc-500">
              [ Formulario de Suscripción en Construcción ]
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
