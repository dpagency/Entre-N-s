import { useState } from 'react';
import { assetUrl } from '../../distribution';
import { cityArtworkSource, ORIGINAL_CITY_ARTWORK } from '../../data/cityArtwork';

export function CityImage({ className, decorative = false }: { className?: string; decorative?: boolean }) {
  const [source, setSource] = useState(() => cityArtworkSource());
  return <img src={assetUrl(source)}
    alt={decorative ? '' : source === ORIGINAL_CITY_ARTWORK
      ? 'Ilustração da Cidade dos Encontros, com suas regiões e espaços públicos.'
      : 'Cidade dos Encontros com pessoas diversas caminhando, conversando e utilizando os espaços públicos.'}
    aria-hidden={decorative || undefined} className={className} draggable={false} fetchPriority="high"
    onError={() => { if (source !== ORIGINAL_CITY_ARTWORK) setSource(ORIGINAL_CITY_ARTWORK); }} />;
}
