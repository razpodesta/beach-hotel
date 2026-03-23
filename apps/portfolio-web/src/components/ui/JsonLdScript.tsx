/**
 * @file JsonLdScript.tsx
 * @description Aparato de Infraestructura SEO de Élite. 
 *              Inyecta metadatos estructurados (Schema.org) en formato JSON-LD.
 *              Implementa tipado recursivo estricto para erradicar 'any' y 
 *              blindaje contra manipulación por motores de traducción.
 * @version 3.0 - SSoT Type-Safe Edition
 * @author Raz Podestá - MetaShark Tech
 */

import React from 'react';

/**
 * CONTRATOS DE DATOS RECURSIVOS (SSoT)
 * @description Define la estructura inmutable de un objeto Schema.org.
 */
type JsonLdPrimitive = string | number | boolean | null;

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
 *              Crucial para el posicionamiento E-E-A-T del Hotel y Festival.
 */
export function JsonLdScript({ data }: JsonLdScriptProps) {
  /**
   * @pilar VIII: Resiliencia. 
   * Se añade la clase 'notranslate' para evitar que traductores de navegador 
   * intenten procesar el contenido técnico del script.
   */
  return (
    <script
      type="application/ld+json"
      className="notranslate"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data, null, 2) }}
      key="jsonld-master-schema"
    />
  );
}