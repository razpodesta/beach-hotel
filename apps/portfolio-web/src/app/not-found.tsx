/**
 * @file apps/portfolio-web/src/app/not-found.tsx
 * @description Paracaídas de error 404 Maestro (Root Sovereign Fallback).
 *              Este componente captura cualquier fuga de enrutamiento que 
 *              escape del contexto de idiomas (/[lang]/...) y evita el 
 *              renderizado de la página genérica blanca de Vercel.
 * @version 1.0 - Root Boundary Hardened
 * @author Raz Podestá - MetaShark Tech
 */

import { redirect } from 'next/navigation';
import { i18n } from '../config/i18n.config';

/**
 * APARATO: RootNotFound
 * @description Redirección táctica. En lugar de mostrar un error sin estilos,
 * empujamos al usuario hacia la zona segura del idioma base, donde el 
 * `not-found.tsx` localizado (con diccionarios y Oxygen UI) se encargará de él.
 */
export default function RootNotFound() {
  console.warn('[HEIMDALL][ROUTING] Root Boundary Breach detected. Forcing redirect to Sovereign Zone.');
  redirect(`/${i18n.defaultLocale}`);
}