import { defineConfig, mergeConfig } from 'vite';
import institutionalConfig from './vite.institutional.config';

// Explicit opt-in: a separate static pilot, without changing either production build.
export default defineConfig(async env => {
  const shared = typeof institutionalConfig === 'function' ? await institutionalConfig(env) : institutionalConfig;
  return mergeConfig(shared, {
    define: { __ENTRE_NOS_LOCAL_JOURNEYS__: 'true' },
    build: { outDir: 'dist-piloto' },
  });
});
