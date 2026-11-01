import { readFileSync } from 'node:fs';
import path from 'node:path';
import { defineConfig, mergeConfig, type Plugin } from 'vite';
import originalConfig from './vite.config.ts';

const root = import.meta.dirname;
const publicBase = './';
const approvedImages: string[] = JSON.parse(readFileSync(path.join(root, 'distribution/institutional-assets.json'), 'utf8'));
// These modules have no place in the individual distribution. A virtual empty export
// keeps the shared App unchanged; no second application or copied game flow is needed.
const omittedComponents = ['OrganizerDashboard', 'MissionReveal', 'MissionCollectiveVote', 'PreTestModal', 'PostTestModal', 'GameSummary', 'TrueFalseChallenge', 'PowerButton'];

function institutionalPackage(): Plugin {
  return {
    name: 'entre-nos-institutional',
    enforce: 'pre',
    transformIndexHtml(html) { return html.replace('lang="en"', 'lang="pt-BR"'); },
    resolveId(source) {
      const name = source.split('/').at(-1)?.replace(/\.tsx$/, '');
      if (name && omittedComponents.includes(name)) return '\0institutional-omitted:' + name;
    },
    load(id) {
      if (id.startsWith('\0institutional-omitted:')) return `export const ${id.split(':').at(-1)} = () => null;`;
      if (id.split('?')[0].replaceAll('\\', '/').endsWith('/src/index.css')) {
        const code = readFileSync(path.join(root, 'src/index.css'), 'utf8');
        const localFont = `@font-face { font-family: 'Nunito'; font-style: normal; font-weight: 400 900; font-display: swap; src: url('./assets/fonts/Nunito-Variable.ttf') format('truetype'); }`;
        return code.replace(/^@import url\('https:\/\/fonts\.googleapis\.com[^\n]+\n/m, '')
          .replace('@import "tailwindcss";', '@import "tailwindcss";\n' + localFont);
      }
    },
    generateBundle(_options, bundle) {
      const runtimePackages = new Set<string>();
      for (const output of Object.values(bundle)) {
        if (output.type !== 'chunk') continue;
        for (const [id, module] of Object.entries(output.modules)) {
          const packageName = id.replaceAll('\\', '/').match(/\/node_modules\/((?:@[^/]+\/)?[^/]+)\//)?.[1];
          if (module.renderedLength && packageName) runtimePackages.add(packageName);
          if (module.renderedLength && /\/(?:api\/|src\/server\/|src\/components\/admin\/)|\/server\.ts$|\/(?:express|ws|dotenv|@google\/genai)\//.test(id.replaceAll('\\', '/'))) {
            this.error(`Forbidden institutional dependency: ${id}`);
          }
        }
        if (/\/api\/(?:game|admin)|UPSTASH_REDIS|ADMIN_PASSKEY|guardioes_admin_key/.test(output.code)) {
          this.error('An old API or administrative reference survived the institutional build.');
        }
      }
      for (const name of approvedImages) {
        this.emitFile({ type: 'asset', fileName: 'personagens/' + name, source: readFileSync(path.join(root, 'public/personagens', name)) });
      }
      this.emitFile({ type: 'asset', fileName: 'licencas/Nunito-OFL.txt', source: readFileSync(path.join(root, 'src/assets/fonts/Nunito-OFL.txt')) });
      const notices = [...runtimePackages].sort().map(name => {
        const directory = path.join(root, 'node_modules', name);
        const metadata = JSON.parse(readFileSync(path.join(directory, 'package.json'), 'utf8'));
        let license = '';
        for (const filename of ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'LICENSE-MIT', 'license']) {
          try { license = readFileSync(path.join(directory, filename), 'utf8'); break; } catch { /* Try the package's other license filename. */ }
        }
        if (!license) this.error(`Runtime license file not found: ${name}`);
        return `${name} ${metadata.version}\n${license}`;
      });
      this.emitFile({ type: 'asset', fileName: 'licencas/DEPENDENCIAS.txt', source: notices.join('\n\n--------------------\n\n') });
    },
  };
}

export default defineConfig(async env => {
  const shared = typeof originalConfig === 'function' ? await originalConfig(env) : originalConfig;
  return mergeConfig(shared, {
    mode: 'institutional',
    define: { __ENTRE_NOS_INSTITUTIONAL__: 'true', __ENTRE_NOS_LOCAL_JOURNEYS__: 'false', __ENTRE_NOS_ASSET_BASE__: JSON.stringify(publicBase) },
    envDir: false,
    envPrefix: [],
    base: publicBase,
    publicDir: false,
    plugins: [institutionalPackage()],
    build: { outDir: 'dist-institucional', sourcemap: false },
  });
});
