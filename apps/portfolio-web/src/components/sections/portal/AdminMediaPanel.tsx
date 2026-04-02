/**
 * @file AdminMediaPanel.tsx
 * @description Orquestador de ingesta multimedia con composición de átomos.
 *              Refactorizado: Purga de importaciones huérfanas, tipado estricto
 *              y ergonomía de despacho.
 * @version 3.1 - Atomic Architecture
 * @author Raz Podestá - MetaShark Tech
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Loader2, CloudUpload } from 'lucide-react';

import { cn } from '../../../lib/utils/cn';
import { useUIStore } from '../../../lib/store/ui.store';
import { uploadMediaAction } from '../../../lib/portal/actions/media.actions';
import { MediaDropzone } from './media/MediaDropzone';
import { MetadataInput } from './media/MetadataInput';
import { UploadStatusIndicator } from './media/UploadStatusIndicator';
import type { AdminMediaDictionary } from '../../../lib/schemas/admin_media.schema';

interface AdminMediaPanelProps {
  mediaLabels: AdminMediaDictionary;
}

export function AdminMediaPanel({ mediaLabels }: AdminMediaPanelProps) {
  const { session } = useUIStore();
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState('');
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);

  const previewUrl = useMemo(() => file ? URL.createObjectURL(file) : null, [file]);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) { setFile(selected); setStatus('idle'); setProgress(0); }
  }, []);

  const handleUpload = async () => {
    if (!file || !altText || !session?.tenantId) return;
    setStatus('uploading'); setProgress(30);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('alt', altText);
    formData.append('tenantId', session.tenantId);

    try {
      const result = await uploadMediaAction(formData);
      if (result.success) {
        setProgress(100); setStatus('success');
        setTimeout(() => { setFile(null); setAltText(''); setStatus('idle'); }, 3000);
      } else throw new Error(result.error);
    } catch { setStatus('error'); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-4xl mx-auto">
      <MediaDropzone 
        file={file} 
        previewUrl={previewUrl} 
        onFileChange={onFileChange} 
        labels={{ prompt: mediaLabels.dropzone_prompt, subtext: mediaLabels.dropzone_subtext }} 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MetadataInput value={altText} onChange={setAltText} label={mediaLabels.label_alt_text} placeholder={mediaLabels.placeholder_alt_text} />
        <UploadStatusIndicator status={status} progress={progress} label={mediaLabels.status_uploading} />
      </div>

      <button 
        onClick={handleUpload} 
        disabled={!file || !altText || status === 'uploading'}
        className={cn(
          "w-full flex items-center justify-center gap-4 py-6 rounded-4xl font-bold uppercase tracking-[0.3em] text-[11px] transition-all",
          (file && altText && status !== 'uploading') 
            ? "bg-foreground text-background hover:bg-primary hover:text-white active:scale-95 shadow-2xl" 
            : "bg-surface text-muted-foreground/40 cursor-not-allowed border border-border"
        )}
      >
         {status === 'uploading' ? <Loader2 className="animate-spin" size={18} /> : <CloudUpload size={18} />}
         {mediaLabels.btn_upload}
      </button>
    </motion.div>
  );
}