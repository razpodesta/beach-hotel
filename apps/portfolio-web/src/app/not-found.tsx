/**
 * @file Atrapador de Vacíos Global (Root Not Found)
 * @version 1.0 - Digital Flow Recovery
 * @description Red de seguridad final para peticiones que no coinciden con ninguna ruta física 
 *              ni segmento de idioma. Redirige forzosamente al Home del idioma soberano.
 * @author MetaShark Tech
 */

import { redirect } from 'next/navigation';
import { i18n } from '../config/i18n.config';

export default function GlobalNotFound() {
  // @pilar VIII: Resiliencia. 
  // Si una ruta no existe en la raíz, re-insertamos al usuario en el ecosistema localizado.
  redirect(`/${i18n.defaultLocale}`);
}