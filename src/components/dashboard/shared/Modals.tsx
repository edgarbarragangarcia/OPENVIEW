import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDestructive = false,
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      
      <div className="relative bg-lms-surface border border-lms-border rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className={`h-1.5 w-full ${isDestructive ? 'bg-red-500' : 'bg-cyan-500'}`} />
        
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isDestructive ? 'bg-red-500/10 text-red-500' : 'bg-cyan-500/10 text-cyan-500'}`}>
              {isDestructive ? <AlertTriangle size={20} /> : <Info size={20} />}
            </div>
            <div className="flex-1 mt-0.5">
              <h3 className="text-lg font-black text-lms-text-primary mb-1">{title}</h3>
              <p className="text-sm text-lms-text-muted leading-relaxed">{message}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 px-6 py-4 bg-lms-bg border-t border-lms-border">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm text-lms-text-muted hover:text-lms-text-primary hover:bg-lms-hover transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => { onConfirm(); onCancel(); }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm text-white transition-all shadow-lg ${
              isDestructive 
                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' 
                : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-500/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

interface PromptModalProps {
  isOpen: boolean;
  title: string;
  message?: string;
  placeholder?: string;
  initialValue?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export function PromptModal({
  isOpen,
  title,
  message,
  placeholder = 'Escribe aquí...',
  initialValue = '',
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel
}: PromptModalProps) {
  const [value, setValue] = useState(initialValue);

  // Reset value when modal opens
  useEffect(() => {
    if (isOpen) setValue(initialValue);
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!value.trim()) return;
    onConfirm(value.trim());
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      
      <div className="relative bg-lms-surface border border-lms-border rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-lms-border">
          <h3 className="font-black text-lms-text-primary text-lg">{title}</h3>
          <button onClick={onCancel} className="text-lms-text-muted hover:text-lms-text-primary transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {message && <p className="text-sm text-lms-text-muted mb-4">{message}</p>}
          <input
            autoFocus
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-3 bg-lms-bg border border-lms-border rounded-xl text-sm font-medium text-lms-text-primary placeholder-lms-text-muted focus:outline-none focus:border-cyan-500 transition-all shadow-inner"
          />
        </form>

        <div className="flex items-center gap-3 px-6 pb-6">
          <button
            onClick={onCancel}
            type="button"
            className="flex-1 py-3 rounded-xl border border-lms-border font-bold text-sm text-lms-text-muted hover:text-lms-text-primary hover:bg-lms-hover transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!value.trim()}
            type="submit"
            className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/20"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
