declare const __ENTRE_NOS_LOCAL_JOURNEYS__: boolean;
// Vite hard-codes this flag. Production/institutional builds cannot enable it at runtime.
// The Node override is solely for isolated automated local tests.
export const LOCAL_JOURNEYS_ENABLED = typeof __ENTRE_NOS_LOCAL_JOURNEYS__ !== 'undefined'
  ? __ENTRE_NOS_LOCAL_JOURNEYS__
  : typeof process !== 'undefined' && process.env.ENTRE_NOS_LOCAL_JOURNEYS === '1';
