/**
 * @file apps/portfolio-web/src/app/not-found.tsx
 * @description Guardián de errores 404 a nivel raíz.
 *              Refactorizado: Inyección de <html> y <body> obligatorios
 *              para el App Router, erradicando el error de Next.js fallback.
 * @version 11.0 - Next.js 15 Native Router Standard
 * @author Staff Engineer - MetaShark Tech
 */

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body style={{ margin: 0, backgroundColor: '#050505', color: '#ffffff', fontFamily: 'sans-serif' }}>
        <main style={{ display: 'flex', height: '100vh', width: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', margin: '0 0 1rem 0' }}>404</h1>
          <p style={{ color: '#a1a1aa', marginBottom: '2rem' }}>Sanctuary perimeter not found.</p>
          <a 
            href="/pt-BR" 
            style={{ padding: '12px 24px', backgroundColor: '#a855f7', color: '#fff', textDecoration: 'none', borderRadius: '9999px', fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 'bold' }}
          >
            Return to Core
          </a>
        </main>
      </body>
    </html>
  );
}