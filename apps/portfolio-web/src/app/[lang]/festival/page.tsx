/**
 * @file Festival Page - Canasvieiras Fest 2026
 * @description Ruta inmersiva para el Pride Escape.
 */
import { getDictionary } from '../../../lib/get-dictionary';
import { BlurText } from '../../../components/razBits/BlurText';
import { BlogSection3D } from '../../../components/sections/homepage/BlogSection3D';
import { type Locale } from '../../../config/i18n.config';
import { getAllPosts } from '../../../lib/blog'; // Reutilizado para experiencias del festival

export default async function FestivalPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const experiences = await getAllPosts();

  return (
    <main className="min-h-screen bg-[#050505] text-white overflow-hidden">
      {/* Hero Inmersivo */}
      <section className="relative pt-32 pb-20 flex flex-col items-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15),transparent_70%)]" />
        
        <BlurText 
          text="CANASVIEIRAS FEST"
          className="font-display text-6xl md:text-9xl font-bold tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-white to-purple-500"
        />
        
        <p className="mt-4 font-mono text-zinc-500 tracking-[0.3em] uppercase">
          The Winter Escape 2026
        </p>
      </section>

      {/* Carrusel de Experiencias 3D (Pilot CMS 3.0 Powered) */}
      <BlogSection3D 
        posts={experiences} 
        dictionary={dict.blog_page} 
        lang={lang} 
      />

      {/* CTA de Tickets */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="rounded-3xl border border-white/10 bg-zinc-900/50 p-12 backdrop-blur-xl">
           <h2 className="font-display text-4xl font-bold mb-6">Únete a la nueva ola</h2>
           <p className="text-zinc-400 mb-10 max-w-xl mx-auto">
             7 días de takeover exclusivo en el corazón de Florianópolis. Barcos, clubs VIP y la mejor comunidad.
           </p>
           <button className="rounded-full bg-white px-10 py-4 font-bold text-black hover:scale-105 transition-transform">
             CONSEGUIR PAQUETE VIP
           </button>
        </div>
      </section>
    </main>
  );
}