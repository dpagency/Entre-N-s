import { useEffect, useRef, useState } from 'react';
import { LearningConfetti } from './LearningConfetti';

export function LearningCelebration({ phase }: { phase?: string }) {
  const seen = useRef(new Set<string>());
  const [key, setKey] = useState<string | null>(null);
  useEffect(() => { setKey(null); }, [phase]);
  useEffect(() => {
    const receive = (event: Event) => {
      const id = (event as CustomEvent).detail;
      if (typeof id !== 'string' || seen.current.has(id)) return;
      seen.current.add(id); setKey(id);
    };
    window.addEventListener('entre-nos-learning-celebration', receive);
    return () => window.removeEventListener('entre-nos-learning-celebration', receive);
  }, []);
  useEffect(() => {
    if (!key) return;
    const timer = window.setTimeout(() => setKey(null), 2100);
    return () => window.clearTimeout(timer);
  }, [key]);
  return key ? <div className="pointer-events-none fixed inset-0 z-[70]" aria-hidden="true"><LearningConfetti key={key} /></div> : null;
}
