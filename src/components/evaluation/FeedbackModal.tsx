import React, { useState } from 'react';
import { Star, MessageSquare, ShieldAlert, FileDown, Mail } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [usability, setUsability] = useState(5);
  const [clarity, setClarity] = useState(5);
  const [interest, setInterest] = useState(5);
  const [comment, setComment] = useState('');
  const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char] || char));
  const generatePdf = () => {
    const printable = window.open('', '_blank');
    if (!printable) {
      window.alert('Permita a abertura de uma nova janela para salvar a avaliação como PDF.');
      return;
    }
    const safeComment = escapeHtml(comment.trim() || 'Não informado');
    printable.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"/><title>Avaliação Entre Nós</title><style>body{font-family:Arial,sans-serif;max-width:720px;margin:48px auto;color:#182331;line-height:1.6;padding:0 20px}h1{color:#087b72}li{margin:12px 0}.comment{white-space:pre-wrap;background:#f3f6f8;padding:16px;border-radius:8px}@media print{button{display:none}}</style></head><body><h1>Entre Nós — Avaliação da experiência</h1><p><strong>Jornada:</strong> Caminhos da Escuta</p><ul><li>Facilidade de uso: <strong>${usability}/5</strong></li><li>Clareza dos dilemas: <strong>${clarity}/5</strong></li><li>Interesse em continuar: <strong>${interest}/5</strong></li></ul><h2>Comentário opcional</h2><p class="comment">${safeComment}</p><p>Envio voluntário à Comissão de Ética do INPI: ceinpi@inpi.gov.br</p><p>Não inclua informações pessoais ou casos institucionais identificáveis.</p><button onclick="window.print()">Salvar ou imprimir em PDF</button></body></html>`);
    printable.document.close();
    printable.focus();
  };
  const openEmail = () => {
    const subject = encodeURIComponent('Entre Nós — Avaliação da jornada Caminhos da Escuta');
    const body = encodeURIComponent('Encaminho, em anexo, minha avaliação da experiência Entre Nós.\n\nO PDF pode ser gerado pelo botão “Gerar PDF” no jogo e deve ser anexado manualmente.');
    window.location.href = `mailto:ceinpi@inpi.gov.br?subject=${subject}&body=${body}`;
  };

  const renderStarRating = (value: number, onChange: (val: number) => void, label: string) => (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs sm:text-sm font-semibold text-slate-200">{label}</label>
        <span className="text-xs font-bold text-amber-400">{value}/5</span>
      </div>
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`p-2 rounded-xl border transition-all ${
              star <= value
                ? 'bg-amber-500/20 border-amber-400 text-amber-400 shadow-sm'
                : 'bg-slate-800/80 border-slate-700 text-slate-500 hover:text-slate-300'
            }`}
            title={`${star} estrelas`}
          >
            <Star className={`w-5 h-5 ${star <= value ? 'fill-current' : ''}`} />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in"
    >
      <div className="relative w-full max-w-lg max-h-[88dvh] overflow-y-auto overscroll-contain bg-slate-900 border border-slate-700 rounded-3xl p-4 sm:p-8 shadow-2xl flex flex-col text-slate-100">
        <div className="space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                Avaliação de Experiência
              </span>
              <h2 className="text-xl font-black text-slate-100 mt-0.5">
                O que você achou do jogo?
              </h2>
              <p className="text-xs text-slate-400">
                Sua avaliação apoia o aprimoramento pedagógico da ferramenta.
              </p>
            </div>

            {/* 3 ratings 1 to 5 */}
            <div className="space-y-4">
              {renderStarRating(
                usability,
                setUsability,
                '1. Facilidade de uso da plataforma e navegação'
              )}

              {renderStarRating(
                clarity,
                setClarity,
                '2. Clareza das orientações éticas e dos dilemas'
              )}

              {renderStarRating(
                interest,
                setInterest,
                '3. Interesse em continuar utilizando em capacitações'
              )}
            </div>

            {/* Optional Comment */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
                Comentário ou Sugestão Opcional:
              </label>

              {/* Explicit warning required by prompt */}
              <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-300 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Aviso:</strong> Para sua segurança e privacidade,{' '}
                  <u>não insira nomes de pessoas reais nem casos institucionais identificáveis</u>.
                </span>
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Compartilhe impressões gerais, sem nomes ou dados pessoais..."
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
              />
            </div>

            <div className="sticky bottom-0 bg-slate-900 border-t border-slate-700 py-3 flex flex-wrap items-center justify-end gap-3">
              <button type="button" onClick={onClose} className="px-4 py-3 rounded-xl bg-slate-800 text-slate-200 font-semibold">Fechar</button>
              <button type="button" onClick={generatePdf} className="px-4 py-3 rounded-xl bg-teal-600 text-white font-bold flex items-center gap-2"><FileDown size={18}/> Gerar PDF</button>
              <button type="button" onClick={openEmail} className="px-4 py-3 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center gap-2"><Mail size={18}/> Abrir e-mail</button>
            </div>
            <p className="text-xs text-slate-400">O PDF é salvo pelo navegador usando “Imprimir / Salvar como PDF”. Anexe-o manualmente ao e-mail. Nenhuma avaliação é enviada automaticamente.</p>
        </div>
      </div>
    </div>
  );
};
