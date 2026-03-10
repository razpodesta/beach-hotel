// RUTA: apps/portfolio-web/src/components/shared/NewsletterForm.tsx
'use client';

export function NewsletterForm() {
  return (
    <div className="p-8 text-center">
      <h3 className="font-display text-2xl font-bold text-white mb-2">Únete al Ecossistema</h3>
      <p className="text-zinc-400 text-sm mb-6">Recibe actualizaciones del festival y el hotel.</p>
      <input 
        type="email" 
        placeholder="Tu email"
        className="w-full bg-black/50 border border-white/10 rounded-full py-3 px-4 outline-none focus:border-purple-500 text-white mb-4"
      />
      <button className="w-full bg-white text-black font-bold py-3 rounded-full uppercase tracking-widest text-xs hover:bg-zinc-200 transition-colors">
        Assinar
      </button>
    </div>
  );
}