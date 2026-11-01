import React, { useContext } from 'react';
import { useReducedMotion, MotionConfigContext } from 'motion/react';

/** Decoração breve e não interativa; respeita a preferência por movimento reduzido. */
export const LearningConfetti: React.FC = () => {
  const reducedMotion = useReducedMotion();
  const configuration = useContext(MotionConfigContext);
  if (reducedMotion || configuration.reducedMotion === 'always') return null;
  const colors = ['#2dd4bf', '#fbbf24', '#fb7185', '#a78bfa', '#38bdf8'];
  return (
    <div data-learning-confetti aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden z-20">
      {Array.from({ length: 24 }, (_, index) => {
        const left = 8 + ((index * 37) % 85);
        const delay = (index % 6) * 0.055;
        return <span
          key={index}
          className="learning-confetti-piece absolute top-0 block h-2 w-1.5 rounded-sm"
          style={{ left: left + '%', backgroundColor: colors[index % colors.length], animationDelay: delay + 's', '--confetti-drift': (index % 2 ? 18 : -18) + 'px' } as React.CSSProperties}
        />;
      })}
    </div>
  );
};
