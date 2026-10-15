import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play, Square, Volume2 } from 'lucide-react';

export function NarrationControl({ text }: { text: string }) {
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [rate, setRate] = useState(1);
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  useEffect(() => () => { if (supported) window.speechSynthesis.cancel(); }, [supported, text]);
  const play = () => {
    if (!supported) return;
    if (paused && utterance.current) { window.speechSynthesis.resume(); setPaused(false); setPlaying(true); return; }
    window.speechSynthesis.cancel();
    const next = new SpeechSynthesisUtterance(text);
    next.lang = 'pt-BR'; next.rate = rate;
    next.onend = () => { setPlaying(false); setPaused(false); utterance.current = null; };
    next.onerror = () => { setPlaying(false); setPaused(false); utterance.current = null; };
    utterance.current = next;
    setPaused(false);
    window.speechSynthesis.speak(next);
    setPlaying(true);
  };
  const pause = () => { window.speechSynthesis.pause(); setPaused(true); setPlaying(false); };
  const stop = () => { window.speechSynthesis.cancel(); utterance.current = null; setPaused(false); setPlaying(false); };
  if (!supported) return <p className="text-xs text-slate-400">Narração indisponível neste navegador. O texto permanece disponível.</p>;
  return <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/60 p-3" role="group" aria-label="Narração opcional">
    <Volume2 className="w-5 h-5 text-teal-300" aria-hidden="true" />
    <button type="button" onClick={playing ? pause : play} className="rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">{playing ? <><Pause className="inline w-4 h-4"/> Pausar</> : <><Play className="inline w-4 h-4"/> {paused ? 'Continuar' : 'Ouvir'}</>}</button>
    <button type="button" onClick={stop} className="rounded-lg bg-slate-800 px-3 py-2 text-sm"><Square className="inline w-4 h-4"/> Parar</button>
    <label className="text-xs text-slate-300">Velocidade <select aria-label="Velocidade da narração" value={rate} onChange={e => {const n=Number(e.target.value);setRate(n);stop();}} className="rounded-lg bg-slate-800 p-2 ml-1">{[0.75,1,1.25,1.5,2].map(v=><option key={v} value={v}>{v}×</option>)}</select></label>
  </div>;
}
