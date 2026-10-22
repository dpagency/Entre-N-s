import React from 'react';
import { X, Eye, Type, ZapOff, Keyboard } from 'lucide-react';

interface AccessibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  reducedMotion: boolean;
  setReducedMotion: (val: boolean) => void;
  fontSize: 'normal' | 'large' | 'xlarge';
  setFontSize: (val: 'normal' | 'large' | 'xlarge') => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
}

export const AccessibilityModal: React.FC<AccessibilityModalProps> = ({
  isOpen,
  onClose,
  reducedMotion,
  setReducedMotion,
  fontSize,
  setFontSize,
  highContrast,
  setHighContrast,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="acc-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in"
    >
      <div className="relative w-full min-w-0 max-w-lg max-h-[90dvh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="min-w-0 flex items-center gap-2.5">
            <div className="hidden sm:block shrink-0 p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/40">
              <Eye className="w-5 h-5" />
            </div>
            <h2 id="acc-title" className="min-w-0 break-words text-lg font-bold text-slate-100">
              Acessibilidade e Preferências Visuais
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Fechar"
            className="shrink-0 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Reduced Motion Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-start gap-3">
              <ZapOff className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-slate-100">Reduzir Animações</div>
                <div className="text-xs text-slate-400">
                  Desativa transições contínuas e efeitos de movimento dinâmico.
                </div>
              </div>
            </div>

            <button
              onClick={() => setReducedMotion(!reducedMotion)}
              className={`shrink-0 w-12 h-8 ml-3 rounded-full p-1 transition-colors ${
                reducedMotion ? 'bg-teal-500' : 'bg-slate-800'
              }`}
              role="switch"
              aria-label="Reduzir Animações"
              aria-checked={reducedMotion}
            >
              <div
                className={`w-5 h-5 rounded-full bg-slate-950 shadow-md transform transition-transform ${
                  reducedMotion ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* High Contrast Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-start gap-3">
              <Eye className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-slate-100">Alto Contraste</div>
                <div className="text-xs text-slate-400">
                  Reforça bordas e demarcações visuais para maior legibilidade.
                </div>
              </div>
            </div>

            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`shrink-0 w-12 h-8 ml-3 rounded-full p-1 transition-colors ${
                highContrast ? 'bg-teal-500' : 'bg-slate-800'
              }`}
              role="switch"
              aria-label="Alto Contraste"
              aria-checked={highContrast}
            >
              <div
                className={`w-5 h-5 rounded-full bg-slate-950 shadow-md transform transition-transform ${
                  highContrast ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Font Size Selector */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
              <Type className="w-4 h-4 text-teal-400" />
              <span>Tamanho do Texto</span>
            </div>
            <div role="group" aria-label="Tamanho do Texto" className="flex flex-wrap gap-2">
              {[
                { id: 'normal', label: 'Padrão' },
                { id: 'large', label: 'Grande' },
                { id: 'xlarge', label: 'Extra' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setFontSize(opt.id as any)}
                  aria-pressed={fontSize === opt.id}
                  className={`flex-1 min-h-11 py-2 px-3 rounded-xl text-sm font-bold border transition-all ${
                    fontSize === opt.id
                      ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-sm'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-850'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Keyboard navigation note */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 space-y-1">
            <div className="font-semibold flex items-center gap-1.5 text-teal-300">
              <Keyboard className="w-4 h-4" />
              Navegação por Teclado Suportada:
            </div>
            <p className="text-slate-400">
              Utilize a tecla <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono">Tab</kbd> para alternar entre os elementos e{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono">Enter</kbd> ou{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono">Espaço</kbd> para selecionar cartas e ações.
            </p>
          </div>
        </div>

        <div className="pt-4 mt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs transition-colors"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
