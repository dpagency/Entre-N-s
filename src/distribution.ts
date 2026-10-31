// Vite replaces these values at build time. Tests outside Vite keep the existing defaults.
declare const __ENTRE_NOS_INSTITUTIONAL__: boolean;
declare const __ENTRE_NOS_ASSET_BASE__: string;
export const INSTITUTIONAL = typeof __ENTRE_NOS_INSTITUTIONAL__ !== 'undefined' && __ENTRE_NOS_INSTITUTIONAL__;
const assetBase = typeof __ENTRE_NOS_ASSET_BASE__ === 'undefined' ? '/' : __ENTRE_NOS_ASSET_BASE__;

export function assetUrl(originalPath: string, base = assetBase) {
  return base.replace(/\/?$/, '/') + originalPath.replace(/^\/+/, '');
}

export function applicationUrl(location: Pick<Location, 'href'>, base = assetBase) {
  return new URL(base, location.href).href;
}
