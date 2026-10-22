import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play, Volume2, Square } from 'lucide-react';

interface Props { phase?: string; missionId?: string }
export const JourneyAudio: React.FC<Props> = ({ phase, missionId }) => {
  const [supported, setSupported] = useState(false);
  const [status, setStatus] = useState<'idle' | 'playing' | 'paused'>('idle');
  const [rate, setRate] = useState(() => {
    try { const saved = Number(localStorage.getItem('entre-nos-narration-rate')); return [0.8, 1, 1.2, 1.5].includes(saved) ? saved : 1; } catch { return 1; }
  });
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const rateRef = useRef(rate);
  const narrationRef = useRef('');
  const positionRef = useRef(0);
  const rateChangedRef = useRef(false);
  const [rateChanged, setRateChanged] = useState(false);
  useEffect(() => { try { localStorage.setItem('entre-nos-narration-rate', String(rate)); } catch { /* Playback still works without storage. */ } }, [rate]);
  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
    return () => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); };
  }, []);
  useEffect(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    narrationRef.current = '';
    positionRef.current = 0;
    rateChangedRef.current = false;
    setRateChanged(false);
    setStatus('idle');
  }, [phase, missionId, supported]);
  const start = () => {
    if (!supported) return;
    const synth = window.speechSynthesis;
    if (status === 'paused' && synth.paused && utteranceRef.current && !rateChangedRef.current) {
      synth.resume(); setStatus('playing'); return;
    }
    // Narrate only passages explicitly identified as story/dialogue.
    // Never read navigation, instructions, scores or other interface text.
    const passages = Array.from(document.querySelectorAll<HTMLElement>('main [data-narration="story"]'));
    const resumingAtNewRate = status === 'paused' && rateChangedRef.current && narrationRef.current;
    const text = resumingAtNewRate ? narrationRef.current : passages.map(el => (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim()).filter(Boolean).join(' ');
    if (!text) { setStatus('idle'); return; }
    const offset = resumingAtNewRate ? positionRef.current : 0;
    narrationRef.current = text;
    positionRef.current = offset;
    const utterance = new SpeechSynthesisUtterance(text.slice(offset));
    utterance.lang = 'pt-BR';
    utterance.rate = rateRef.current;
    utterance.onboundary = event => { if (utteranceRef.current === utterance) positionRef.current = offset + event.charIndex; };
    utterance.onend = () => { if (utteranceRef.current === utterance) setStatus('idle'); };
    utterance.onerror = () => { if (utteranceRef.current === utterance) setStatus('idle'); };
    utteranceRef.current = utterance;
    synth.cancel();
    if (synth.paused) synth.resume();
    rateChangedRef.current = false;
    setRateChanged(false);
    synth.speak(utterance);
    setStatus('playing');
  };
  const pause = () => { if (supported && utteranceRef.current) { window.speechSynthesis.pause(); setStatus('paused'); } };
  const stop = () => { utteranceRef.current = null; if (supported) window.speechSynthesis.cancel(); narrationRef.current = ''; positionRef.current = 0; rateChangedRef.current = false; setRateChanged(false); setStatus('idle'); };
  if (!supported || !phase || phase === 'LOBBY') return null;
  return (
    <div role="group" aria-label="Narração da etapa" className="relative z-10 mx-auto w-full max-w-7xl px-2 py-2 bg-slate-950/95 border-b border-slate-800">
      <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
        <span className="flex items-center gap-1 text-teal-200 font-bold"><Volume2 size={18}/> <span className="hidden sm:inline">Ouvir personagens</span></span>
        <button type="button" onClick={status === 'playing' ? pause : start} className="min-h-11 px-3 rounded-xl bg-teal-700 text-white font-bold flex items-center gap-1">
          {status === 'playing' ? <><Pause size={17}/> Pausar</> : <><Play size={17}/> {status === 'paused' ? 'Continuar' : 'Ouvir'}</>}
        </button>
        <button type="button" onClick={stop} disabled={status === 'idle'} className="min-h-11 px-3 rounded-xl bg-slate-800 disabled:opacity-40 flex items-center gap-1"><Square size={15}/> Parar</button>
        <label className="flex items-center gap-1 text-slate-200"><span className="sr-only">Velocidade</span>
          <select aria-label="Velocidade da narração" value={rate} onChange={e => { const nextRate = Number(e.target.value); rateRef.current = nextRate; setRate(nextRate); if (status !== 'idle') { rateChangedRef.current = true; setRateChanged(true); if (status === 'playing') pause(); } }} className="bg-slate-800 text-white rounded-lg min-h-11 px-2">
            <option value={0.8}>0,8×</option><option value={1}>1×</option><option value={1.2}>1,2×</option><option value={1.5}>1,5×</option>
          </select>
        </label>
        {status === 'paused' && <span role="status" className="text-xs text-slate-400">{rateChanged ? 'Ao continuar, aplica a nova velocidade a partir da última posição informada pela voz.' : 'Retoma de onde parou'}</span>}
      </div>
    </div>
  );
};
