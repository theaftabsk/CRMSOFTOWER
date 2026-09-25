'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onCancel();
      } else if (e.key === 'Enter') {
        onConfirm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel, onConfirm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurred Liquid Backdrop */}
      <div 
        className="fixed inset-0 bg-black/25 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onCancel}
      />

      {/* Liquid Glass Modal Window */}
      <div className="relative w-full max-w-md liquid-glass-modal p-6 text-center select-none shadow-2xl z-10 liquid-animate-in border border-white/80">
        {/* Dialog Header */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-black/[0.05]">
          <span className="text-xs font-semibold text-[#111111] tracking-tight">Confirm Action</span>
          <button 
            onClick={onCancel}
            className="p-1 rounded-lg text-[#888888] hover:text-[#111111] hover:bg-black/5 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Alert Icon with Liquid Glow */}
        <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-b from-red-50 to-red-100/60 border border-red-200/60 shadow-[0_8px_16px_rgba(220,38,38,0.12)]">
          {isDestructive ? (
            <Trash2 className="w-7 h-7 text-[#DC2626] animate-pulse" />
          ) : (
            <AlertTriangle className="w-7 h-7 text-[#F59E0B]" />
          )}
        </div>

        {/* Content */}
        <h3 className="text-base font-semibold text-[#111111] tracking-tight mb-1.5">
          {title}
        </h3>
        <p className="text-xs text-[#555555] leading-relaxed mb-6 px-2">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 justify-center">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 px-4 rounded-xl text-xs font-medium text-[#333333] liquid-glass hover:bg-white hover:border-black/20 btn-liquid transition cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-semibold text-white btn-liquid transition shadow-md cursor-pointer ${
              isDestructive 
                ? 'bg-gradient-to-b from-[#EF4444] to-[#DC2626] hover:from-[#DC2626] hover:to-[#B91C1C] border border-red-600/50 shadow-red-500/25' 
                : 'bg-gradient-to-b from-[#111111] to-[#222222] hover:from-[#000000] hover:to-[#111111] border border-black/80'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

