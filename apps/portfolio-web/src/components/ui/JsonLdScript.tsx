/**
 * @file JsonLdScript.tsx
 * @description Aparato de Infraestructura SEO de Élite. 
 *              Inyecta metadatos estructurados (Schema.org) en formato JSON-LD.
 *              Implementa tipado recursivo resiliente para orquestar datos 
 *              provenientes de entornos híbridos (Env Vars + CMS).
 * @version 4.0 - Resilient Primitive Sync (Fix TS2322)
 * @author Raz Podestá - MetaShark Tech
 */

import React from 'react';

/**
 * CONTRATOS DE DATOS RECURSIVOS (SSoT)
 * @description Define la estructura inmutable de un objeto Schema.org.
 * @pilar III: Seguridad de Tipos - Inclusión de 'undefined' para permitir 
 * el filtrado orgánico de llaves opcionales durante la serialización.
 */
type JsonLdPrimitive = string | number | boolean | null | undefined;

interface JsonLdObject {
  [key: string]: JsonLdValue;
}

type JsonLdArray = JsonLdValue[];

/**
 * @type JsonLdValue
 * @description Unión discriminada recursiva para representar estructuras JSON complejas.
 */
type JsonLdValue = JsonLdPrimitive | JsonLdObject | JsonLdArray;

/**
 * @interface JsonLdScriptProps
 * @property {JsonLdObject} data - Objeto de datos estructurados validado por esquema.
 */
interface JsonLdScriptProps {
  data: JsonLdObject;
}

/**
 * APARATO: JsonLdScript
 * @description Renderiza una etiqueta <script> de tipo 'application/ld+json'.
 *              Esencial para el posicionamiento E-E-A-T y la visibilidad en SERP.
 */
export function JsonLdScript({ data }: JsonLdScriptProps) {
  /**
   * @pilar VIII: Resiliencia. 
   * Se utiliza un replacer nulo en stringify para asegurar que las llaves 
   * 'undefined' sean omitidas del bundle final, optimizando el tamaño del DOM.
   * Se añade la clase 'notranslate' para blindar el script contra traductores.
   */
  return (
    <script
      type="application/ld+json"
      className="notranslate"
      dangerouslySetInnerHTML={{ 
        __html: JSON.stringify(data, null, 2) 
      }}
      key="jsonld-master-schema"
    />
  );
}