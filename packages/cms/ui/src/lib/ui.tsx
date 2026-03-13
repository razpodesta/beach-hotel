/**
 * @file packages/cms/ui/src/lib/ui.tsx
 * @description Componente base de MetaShark CMS UI. 
 *              Nivelado para evitar errores de hidratación y asegurar integridad de estilos.
 * @version 2.4 - Type Safe & Resolvable
 */

import React from 'react';
import styles from './ui.module.css';

/**
 * Aparato Visual: MetasharkCmsUi
 * Provee un contenedor estandarizado para módulos del panel administrativo.
 */
export function MetasharkCmsUi() {
  return (
    <div className={styles.container}>
      <h1 className="text-2xl font-display font-bold text-white tracking-tight">
        MetaShark CMS Interface
      </h1>
      <p className="text-zinc-400 font-sans text-sm leading-relaxed">
        Sistema orquestado para la gestión de activos de hospitalidad de élite.
      </p>
    </div>
  );
}

export default MetasharkCmsUi;