import { PLAYER_AVATARS } from '../../data/pilot';
import { assetUrl } from '../../distribution';

export function PlayerAvatar({ index, name, large = false }: { index: number; name?: string; large?: boolean }) {
  const avatar = PLAYER_AVATARS[((index % 4) + 4) % 4];
  return <img src={assetUrl(avatar.image)} alt={name || avatar.name} className={`${large ? 'w-32 h-32 sm:w-48 sm:h-48' : 'w-16 h-16'} mx-auto shrink-0 rounded-full object-contain border-2 border-teal-300/60`} />;
}
