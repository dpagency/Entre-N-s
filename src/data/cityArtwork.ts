// The approved illustration is separate; keep the original immutable for fallback.
export const ORIGINAL_CITY_ARTWORK = '/personagens/cidade-dos-encontros.webp';
export const APPROVED_CITY_ARTWORK = '/personagens/cidade-dos-encontros-nova.png';
export const CITY_ARTWORK: { original: string; alternative: string | null; approved: boolean } = {
  original: ORIGINAL_CITY_ARTWORK, alternative: APPROVED_CITY_ARTWORK, approved: true,
};
export function cityArtworkSource(config = CITY_ARTWORK): string {
  return config.approved && config.alternative ? config.alternative : config.original;
}
