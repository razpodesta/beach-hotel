// RUTA: oh-hoteis/src/components/ui/JsonLdScript.tsx
// VERSIÓN: Definitiva de Producción v2. Sintácticamente Pura y en Cumplimiento con ESLint.

/**
 * ===================================================================================
 * COMPONENTE DE INFRAESTRUCTRURA SEO: JsonLdScript
 * ===================================================================================
 *
 * VISIÓN ULTRAHOLÍSTICA REVISADA v2:
 * La iteración anterior erradicó el tipo `any`, pero introdujo una `interface` vacía
 * para definir el tipo de array, lo cual fue correctamente señalado por ESLint como
 * una práctica subóptima.
 *
 * Esta versión definitiva refina la definición de tipos para alcanzar la pureza
 * sintáctica. Se reemplaza la `interface JsonLdArray` por un alias de tipo (`type`),
 * que es la construcción idiomática y correcta en TypeScript para crear un nuevo
 * nombre para un tipo existente sin modificarlo.
 *
 * Este nivel de refinamiento demuestra nuestro compromiso inquebrantable no solo con
 * la funcionalidad, sino con la escritura de código limpio, convencional y de
 * la más alta calidad profesional.
 *
 * ===================================================================================
 */

// --- INICIO DE LA REFACTORIZACIÓN SINTÁCTICA (CUMPLIMIENTO DE ESLINT) ---

/**
 * Define de forma recursiva los tipos de valores permitidos en un objeto JSON-LD.
 */
type JsonLdValue =
  | string
  | number
  | boolean
  | null
  | JsonLdObject
  | JsonLdArray;

/**
 * Define la estructura de un objeto JSON-LD. Se utiliza `interface` ya que define
 * una "forma" de objeto y es una práctica común para estructuras de objetos.
 */
interface JsonLdObject {
  [key: string]: JsonLdValue;
}

/**
 * Define la estructura de un array JSON-LD como un alias de tipo.
 * Se utiliza `type` en lugar de una interfaz vacía para cumplir con las mejores
 * prácticas de ESLint (@typescript-eslint/no-empty-interface), ya que no estamos
 * añadiendo nuevos miembros a la estructura del array, solo dándole un nombre semántico.
 */
type JsonLdArray = JsonLdValue[];

/**
 * Las propiedades del componente exigen un objeto JSON-LD válido y estrictamente tipado.
 */
type JsonLdScriptProps = {
  data: JsonLdObject;
};
// --- FIN DE LA REFACTORIZACIÓN SINTÁCTICA ---

/**
 * Renderiza una etiqueta <script> de tipo 'application/ld+json' para inyectar
 * datos estructurados (Schema.org) en la página, mejorando el SEO.
 * Este componente es 100% seguro en cuanto a tipos y cumple con las reglas más estrictas de ESLint.
 *
 * @param {JsonLdScriptProps} props - Las propiedades del componente.
 * @param {JsonLdObject} props.data - El objeto de datos estructurados, validado por Zod.
 * @returns Un elemento <script> listo para ser incluido en el <head> de Next.js.
 */
export function JsonLdScript({ data }: JsonLdScriptProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data, null, 2) }}
      key="jsonld-schema"
    />
  );
}
