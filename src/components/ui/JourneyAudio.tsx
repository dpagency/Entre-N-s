import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, Volume2, Square } from 'lucide-react';

interface Props { phase?: string; missionId?: string }
export const JourneyAudio: React.FC<Props> = ({ phase, missionId }) => {
  const [supported, setSupported] = useState(false);
  const [status, setStatus] = useState<'idle' | 'playing' | 'paused'>('idle');
  const [rate, setRate] = useState(1);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const rateRef = useRef(rate);
  useEffect(() => { rateRef.current = rate; }, [rate]);
  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
    return () => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); };
  }, []);
  useEffect(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setStatus('idle');
  }, [phase, missionId, supported]);
  const start = () => {
    if (!supported) return;
    const synth = window.speechSynthesis;
    if (status === 'paused' && synth.paused && utteranceRef.current) {
      synth.resume(); setStatus('playing'); return;
    }
    synth.cancel();
    const root = document.querySelector('main');
    if (!root) return;
    const copy = root.cloneNode(true) as HTMLElement;
    copy.querySelectorAll('button, input, select, textarea, nav, svg, [aria-hidden="true"]').forEach(el => el.remove());
    const text = (copy.innerText || copy.textContent || '').replace(/\s+/g, ' ').trim();
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = rateRef.current;
    utterance.onend = () => { if (utteranceRef.current === utterance) setStatus('idle'); };
    utterance.onerror = () => { if (utteranceRef.current === utterance) setStatus('idle'); };
    utteranceRef.current = utterance;
    synth.speak(utterance);
    setStatus('playing');
  };
  const pause = () => { window.speechSynthesis.pause(); setStatus('paused'); };
  const stop = () => { window.speechSynthesis.cancel(); utteranceRef.current = null; setStatus('idle'); };
  if (!supported || !phase || phase === 'LOBBY') return null;
  return (
    <div role="group" aria-label="Narração da etapa" className="sticky top-0 z-40 mx-auto w-full max-w-7xl px-3 py-2 bg-slate-950/95 border-b border-slate-800">
      <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
        <span className="flex items-center gap-1 text-teal-200 font-bold"><Volume2 size={18}/> Ouvir história</span>
        <button type="button" onClick={status === 'playing' ? pause : start} className="min-h-11 px-3 rounded-xl bg-teal-700 text-white font-bold flex items-center gap-1">
          {status === 'playing' ? <><Pause size={17}/> Pausar</> : <><Play size={17}/> {status === 'paused' ? 'Continuar' : 'Ouvir'}</>}
        </button>
        <button type="button" onClick={stop} disabled={status === 'idle'} className="min-h-11 px-3 rounded-xl bg-slate-800 disabled:opacity-40 flex items-center gap-1"><Square size={15}/> Parar</button>
        <label className="flex items-center gap-1 text-slate-200">Velocidade
          <select aria-label="Velocidade da narração" value={rate} onChange={e => { setRate(Number(e.target.value)); if (status !== 'idle') stop(); }} className="bg-slate-800 text-white rounded-lg min-h-11 px-2">
            <option value={0.8}>0,8×</option><option value={1}>1×</option><option value={1.2}>1,2×</option><option value={1.5}>1,5×</option>
          </select>
        </label>
        {status === 'paused' && <span className="text-xs text-slate-400">Retoma de onde parou</span>}
      </div>
    </div>
  );
};