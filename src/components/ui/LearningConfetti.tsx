import React, { useContext } from 'react';
import { motion, useReducedMotion, MotionConfigContext } from 'motion/react';

/** Decoração breve e não interativa; respeita a preferência por movimento reduzido. */
export const LearningConfetti: React.FC = () => {
  const reducedMotion = useReducedMotion();
  const configuration = useContext(MotionConfigContext);
  if (reducedMotion || configuration.reducedMotion === 'always') return null;
  const colors = ['#2dd4bf', '#fbbf24', '#fb7185', '#a78bfa', '#38bdf8'];
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden z-20">
      {Array.from({ length: 24 }, (_, index) => {
        const left = 8 + ((index * 37) % 85);
        const delay = (index % 6) * 0.055;
        return <motion.span
          key={index}
          className="absolute top-0 block h-2 w-1.5 rounded-sm"
          style={{ left: left + '%', backgroundColor: colors[index % colors.length] }}
          initial={{ opacity: 0, y: -20, x: 0, rotate: 0 }}
          animate={{ opacity: [0, 1, 1, 0], y: [0, 90, 210, 330], x: [0, (index % 2 ? 1 : -1) * 18, 0], rotate: 360 }}
          transition={{ duration: 1.65, delay, ease: 'easeOut' }}
        />;
      })}
    </div>
  );
};
