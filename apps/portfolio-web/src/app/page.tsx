/**
 * @file Redireccionador de Raíz (Root Page Absoluto)
 * @version 1.0 - Vercel 404 Prevention
 * @description Punto de montaje físico para la ruta '/'.
 *              Ejecuta una redirección del lado del servidor (SSR) hacia el
 *              idioma por defecto, garantizando que Vercel no emita un error 404.
 * @author MetaShark Tech
 */

import { redirect } from 'next/navigation';
import { i18n } from '../config/i18n.config';

export default function RootRedirectPage() {
  // Redirección incondicional y estricta hacia el idioma soberano por defecto (pt-BR).
  // Next.js optimiza esta redirección a nivel de servidor durante el build.
  redirect(`/${i18n.defaultLocale}`);
}