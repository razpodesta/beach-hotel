/**
 * @file MediaActionToolbar.tsx
 * @description Barra de acciones para activos multimedia.
 * @version 1.0 - Atomic UI
 */

import React, { useState } from 'react';
import { Trash2, ExternalLink, Copy, Check } from 'lucide-react';
// import { cn } from '../../../../lib/utils/cn';

interface ToolbarProps {
  url: string;
  id: string;
  onDelete: (id: string) => void;
  labels: { delete: string; copy: string; view: string };
}

export const MediaActionToolbar = ({ url, id, onDelete, labels }: ToolbarProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="flex items-center justify-between pt-4 border-t border-border/40">
      <div className="flex gap-2">
        <button onClick={handleCopy} className="p-2.5 rounded-xl bg-surface border border-border hover:text-primary transition-all active:scale-90" title={labels.copy}>
          {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
        </button>
        <a href={url} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-surface border border-border hover:text-primary transition-all" title={labels.view}>
          <ExternalLink size={14} />
        </a>
      </div>
      <button onClick={() => onDelete(id)} className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-95" title={labels.delete}>
        <Trash2 size={14} />
      </button>
    </footer>
  );
};