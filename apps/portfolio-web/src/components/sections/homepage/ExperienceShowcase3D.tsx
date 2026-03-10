/**
 * @file ExperienceShowcase3D.tsx
 * @version 1.0 - Naturalizado para Festival
 * @description Carrusel orbital 3D que muestra las actividades del Pride Escape.
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ship, Martini, Sunset, MapPin, ChevronRight, ChevronLeft } from 'lucide-react';
import Image from 'next/image';

interface Experience {
  id: string;
  title: string;
  location: string;
  description: string;
  image: string;
  icon: any;
  color: string;
}

const EXPERIENCES: Experience[] = [
  {
    id: 'boat-party',
    title: "BOAT PARTY",
    location: "Baía Norte",
    description: "Sunset cruise com DJ set internacional e open bar premium.",
    image: "/images/festival/boat-party.jpg",
    icon: Ship,
    color: "#a855f7" // Purple Neon
  },
  {
    id: 'praia-mole',
    title: "MOLE CIRCUIT",
    location: "Praia Mole",
    description: "Beach club takeover. O epicentro da comunidade em Floripa.",
    image: "/images/festival/praia-mole.jpg",
    icon: Martini,
    color: "#ec4899" // Pink Neon
  },
  {
    id: 'hq-party',
    title: "HQ SUNSET",
    location: "Beach Hotel",
    description: "Pool party exclusiva no nosso Headquarters em Canasvieiras.",
    image: "/images/festival/hq-party.jpg",
    icon: Sunset,
    color: "#3b82f6" // Blue Neon
  }
];

export function ExperienceShowcase3D() {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((prev) => (prev + 1) % EXPERIENCES.length);
  const prev = () => setIndex((prev) => (prev - 1 + EXPERIENCES.length) % EXPERIENCES.length);

  const active = EXPERIENCES[index];

  return (
    <section className="relative py-24 bg-[#050505] overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center gap-16">
          
          {/* --- Lado Izquierdo: Visual (The Stack) --- */}
          <div className="relative w-full md:w-1/2 aspect-square flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, scale: 0.8, rotateY: -20 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 1.2, rotateY: 20 }}
                transition={{ duration: 0.6, ease: "circOut" }}
                className="relative w-[320px] h-[440px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
              >
                <Image src={active.image} alt={active.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6">
                   <active.icon className="text-white mb-2" size={32} />
                   <h3 className="font-display text-3xl font-bold text-white tracking-tighter">{active.title}</h3>
                </div>
              </motion.div>
            </AnimatePresence>
            
            {/* Elementos decorativos WebGL/3D simulados */}
            <div className="absolute inset-0 border border-white/5 rounded-full animate-spin-slow pointer-events-none" />
          </div>

          {/* --- Lado Derecho: Contenido & Controles --- */}
          <div className="w-full md:w-1/2">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 text-zinc-500 font-mono text-sm uppercase tracking-widest">
                <MapPin size={14} /> {active.location}
              </div>
              <h2 className="font-display text-5xl md:text-7xl font-bold text-white tracking-tighter">
                THE <span style={{ color: active.color }}>{active.title.split(' ')[0]}</span> <br />
                EXPERIENCE
              </h2>
              <p className="text-zinc-400 text-lg max-w-md leading-relaxed">
                {active.description}
              </p>
              
              <div className="flex gap-4 pt-8">
                <button onClick={prev} className="p-4 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-white">
                  <ChevronLeft size={24} />
                </button>
                <button onClick={next} className="p-4 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-white">
                  <ChevronRight size={24} />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}