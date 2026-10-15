import React from 'react';
import { CharacterId } from '../../types/game';
import { CHARACTERS, AVATAR_VARIANTS } from '../../data/characters';

interface CharacterAvatarProps {
  characterId: CharacterId;
  variantIndex?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  isOnline?: boolean;
  isReady?: boolean;
  hasUsedPower?: boolean;
  className?: string;
}

export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  characterId,
  variantIndex = 0,
  size = 'md',
  showBadge = true,
  isOnline,
  isReady,
  hasUsedPower,
  className = '',
}) => {
  const char = CHARACTERS[characterId] || CHARACTERS.alex;
  const [imageFormat, setImageFormat] = React.useState<'webp' | 'png' | 'svg'>('webp');
  React.useEffect(() => setImageFormat('webp'), [characterId]);
  const avatarSrc = `/characters/${characterId}.${imageFormat === 'webp' ? 'webp' : 'png'}`;
  const variant = AVATAR_VARIANTS[variantIndex % AVATAR_VARIANTS.length];

  const sizeDimensions = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
  }[size];

  // Specific SVGs per character
  const renderCharacterSvg = () => {
    switch (characterId) {
      case 'alex':
        // Explorer with magnifying compass & scarf
        return (
          <g>
            <circle cx="50" cy="50" r="46" fill="#0f2b2b" stroke="#14b8a6" strokeWidth="4" />
            {/* Scarf / mantle */}
            <path d="M 24 74 Q 50 90 76 74 Q 85 92 15 92 Z" fill="#0d9488" />
            {/* Face */}
            <circle cx="50" cy="46" r="24" fill="#fed7aa" />
            {/* Hair */}
            <path d="M 28 42 C 28 26 38 18 50 18 C 62 18 72 26 72 42 C 68 34 58 30 50 30 C 40 30 32 36 28 42 Z" fill="#b45309" />
            {/* Eyes */}
            <circle cx="42" cy="45" r="3" fill="#1e293b" />
            <circle cx="58" cy="45" r="3" fill="#1e293b" />
            {/* Smile */}
            <path d="M 44 54 Q 50 60 56 54" stroke="#78350f" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            {/* Magnifying Glass / Monocle */}
            <circle cx="62" cy="45" r="7" stroke="#fbbf24" strokeWidth="2" fill="none" />
            <line x1="67" y1="50" x2="74" y2="58" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        );

      case 'joana':
        // Strategist with eyeglasses and scroll/quill symbol
        return (
          <g>
            <circle cx="50" cy="50" r="46" fill="#172554" stroke="#3b82f6" strokeWidth="4" />
            {/* Formal collar */}
            <path d="M 26 80 L 50 62 L 74 80 L 78 95 L 22 95 Z" fill="#2563eb" />
            <polygon points="50,65 42,80 58,80" fill="#e2e8f0" />
            {/* Face */}
            <circle cx="50" cy="44" r="23" fill="#fde68a" />
            {/* Structured hair */}
            <path d="M 26 44 C 24 22 42 16 50 16 C 58 16 76 22 74 44 C 70 36 64 28 50 28 C 36 28 30 36 26 44 Z" fill="#312e81" />
            {/* Smart glasses */}
            <rect x="34" y="38" width="13" height="10" rx="3" fill="none" stroke="#60a5fa" strokeWidth="2" />
            <rect x="53" y="38" width="13" height="10" rx="3" fill="none" stroke="#60a5fa" strokeWidth="2" />
            <line x1="47" y1="43" x2="53" y2="43" stroke="#60a5fa" strokeWidth="2" />
            {/* Eyes */}
            <circle cx="40" cy="43" r="2.5" fill="#1e1b4b" />
            <circle cx="60" cy="43" r="2.5" fill="#1e1b4b" />
            {/* Confident smile */}
            <path d="M 44 55 Q 50 59 56 55" stroke="#854d0e" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
        );

      case 'ravi':
        // Mediator with gentle aura and listening headset / ear jewel
        return (
          <g>
            <circle cx="50" cy="50" r="46" fill="#451a03" stroke="#f59e0b" strokeWidth="4" />
            {/* Warm shawl */}
            <path d="M 22 78 Q 50 94 78 78 L 84 96 L 16 96 Z" fill="#d97706" />
            {/* Face */}
            <circle cx="50" cy="46" r="24" fill="#fcd34d" />
            {/* Soft curls */}
            <path d="M 26 44 C 24 25 36 17 50 17 C 64 17 76 25 74 44 C 74 32 60 26 50 26 C 40 26 26 32 26 44 Z" fill="#713f12" />
            {/* Eyes closed in active empathetic listening */}
            <path d="M 37 45 Q 42 41 47 45" stroke="#451a03" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 53 45 Q 58 41 63 45" stroke="#451a03" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            {/* Serene smile */}
            <path d="M 43 54 Q 50 62 57 54" stroke="#451a03" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            {/* Listener badge/earpiece */}
            <circle cx="27" cy="46" r="4" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
            <circle cx="73" cy="46" r="4" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
          </g>
        );

      case 'bia':
        // Questioner with piercing gaze, notebook/feather quill
        return (
          <g>
            <circle cx="50" cy="50" r="46" fill="#4c0519" stroke="#f43f5e" strokeWidth="4" />
            {/* Modern cape/jacket */}
            <path d="M 24 76 L 50 64 L 76 76 L 80 96 L 20 96 Z" fill="#e11d48" />
            {/* Face */}
            <circle cx="50" cy="45" r="23" fill="#ffedd5" />
            {/* Sharp fringe & bob cut */}
            <path d="M 25 45 C 24 24 38 16 50 16 C 62 16 76 24 75 45 C 68 32 58 28 50 28 C 42 28 32 32 25 45 Z" fill="#1c1917" />
            {/* Inquiring eyebrows */}
            <path d="M 37 38 L 47 40" stroke="#1c1917" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 53 40 L 63 36" stroke="#1c1917" strokeWidth="2.5" strokeLinecap="round" />
            {/* Alert eyes */}
            <circle cx="42" cy="44" r="3" fill="#881337" />
            <circle cx="58" cy="43" r="3" fill="#881337" />
            {/* Inquisitive smirk */}
            <path d="M 45 54 Q 52 57 58 53" stroke="#881337" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* Quill symbol on forehead headband */}
            <polygon points="50,22 47,28 53,28" fill="#fb7185" />
          </g>
        );
    }
  };

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      <div className={`relative rounded-full overflow-hidden shadow-lg border-2 ${char.borderColor} ${sizeDimensions}`}>
        {imageFormat !== 'svg' ? (
          <img src={avatarSrc} alt={char.name} className="w-full h-full object-cover" onError={() => setImageFormat(current => current === 'webp' ? 'png' : 'svg')} />
        ) : (
          <svg viewBox="0 0 100 100" className="w-full h-full" aria-label={char.name} role="img">
            {renderCharacterSvg()}
          </svg>
        )}

        {/* Approved artwork in WebP; legacy PNG and SVG remain as safe fallbacks. */}
        {/* Variant color highlight aura */}
        <div
          className="absolute inset-0 rounded-full opacity-20 pointer-events-none mix-blend-color-burn"
          style={{ backgroundColor: char.color }}
        />
      </div>

      {/* Variant Badge */}
      {showBadge && (
        <span
          className={`absolute -bottom-1 -right-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white shadow-md border border-slate-900 ${variant.badgeColor}`}
          title={`Variante ${variant.label} (${variant.suffix})`}
        >
          {variant.suffix}
        </span>
      )}

      {/* Online indicator */}
      {isOnline !== undefined && (
        <span
          className={`absolute -top-1 -left-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 shadow ${
            isOnline ? 'bg-emerald-400' : 'bg-slate-500'
          }`}
          title={isOnline ? 'Conectado' : 'Desconectado'}
        />
      )}

      {/* Ready indicator */}
      {isReady !== undefined && (
        <span
          className={`absolute -top-1 -right-1 text-[9px] font-extrabold px-1 py-0.2 rounded-full text-slate-950 border border-slate-900 ${
            isReady ? 'bg-emerald-400' : 'bg-amber-400'
          }`}
          title={isReady ? 'Pronto!' : 'Aguardando'}
        >
          {isReady ? '✓' : '…'}
        </span>
      )}

      {/* Power consumed icon indicator */}
      {hasUsedPower && (
        <span
          className="absolute top-1/2 -right-2 transform -translate-y-1/2 bg-slate-800 text-amber-400 text-[10px] p-0.5 rounded-full border border-amber-500/50"
          title="Poder consumido nesta partida"
        >
          ⚡
        </span>
      )}
    </div>
  );
};
