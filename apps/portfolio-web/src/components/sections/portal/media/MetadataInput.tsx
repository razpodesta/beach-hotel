/**
 * @file MetadataInput.tsx
 * @description Módulo de captura de metadatos SEO. 
 * @version 1.0 - Atomic UI
 */

import React from 'react';
import { Camera } from 'lucide-react';
// import { cn } from '../../../../lib/utils/cn';

interface MetadataInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  label: string;
}

export const MetadataInput = ({ value, onChange, placeholder, label }: MetadataInputProps) => (
  <div className="p-8 rounded-4xl bg-surface border border-border/40 space-y-6 transition-all hover:border-primary/20">
    <p className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground uppercase tracking-widest font-bold">
      <Camera size={14} className="text-primary" /> {label}
    </p>
    <input 
      type="text" 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-background/50 border border-border/50 rounded-2xl py-4 px-6 text-sm outline-none focus:border-primary/40 transition-all text-foreground"
    />
  </div>
);