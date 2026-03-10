// RUTA: /packages/cms/ui/src/lib/ui.tsx
// VERSIÓN: 2.0 - Corregido y Funcional

// Se importa el objeto de estilos desde el archivo CSS Module correspondiente.
// Asumimos que tienes un archivo ui.module.css o similar.
import styles from './ui.module.css';

export function MetasharkCmsUi() {
  return (
    // Ahora la variable 'styles' está definida y la clase se aplicará correctamente.
    <div className={styles['container']}>
      <h1>Welcome to MetasharkCmsUi!</h1>
    </div>
  );
}

export default MetasharkCmsUi;
