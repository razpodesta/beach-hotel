/**
 * @file packages/cms/ui/src/lib/ui.tsx
 * @description Componente base de MetaShark CMS UI. 
 *              Refactorizado: Eliminada importación redundante de React (React 19 Standard).
 * @version 2.5 - ESM & JSX Transform Optimized
 * @author Raz Podestá - MetaShark Tech
 */

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