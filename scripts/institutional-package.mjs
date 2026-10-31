import { readFile, readdir, stat, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const projectRoot = fileURLToPath(new URL('../', import.meta.url));
export const siteRoot = path.join(projectRoot, 'dist-institucional');
const outputRoot = path.join(projectRoot, 'artifacts/institutional');
const images = JSON.parse(await readFile(path.join(projectRoot, 'distribution/institutional-assets.json'), 'utf8'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const forbidden = /\/api\/(?:game|admin)|UPSTASH_REDIS|ADMIN_PASSKEY|guardioes_admin_key|fonts\.googleapis\.com|fonts\.gstatic\.com|-----BEGIN [A-Z ]*PRIVATE KEY-----|github_pat_[A-Za-z0-9_]{20,}|gh[pousr]_[A-Za-z0-9]{20,}/;

async function filesBelow(directory, prefix = '') {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const name = prefix + entry.name;
    if (entry.isSymbolicLink()) throw Error(`Symbolic link not allowed: ${name}`);
    if (entry.isDirectory()) files.push(...await filesBelow(path.join(directory, entry.name), name + '/'));
    else if (entry.isFile()) files.push(name);
    else throw Error(`Unsupported file: ${name}`);
  }
  return files.sort();
}

export async function verifySite(directory = siteRoot) {
  const files = await filesBelow(directory);
  const entries = [];
  for (const name of files) {
    const allowed = name === 'index.html' || ['licencas/Nunito-OFL.txt', 'licencas/DEPENDENCIAS.txt'].includes(name)
      || /^assets\/[\w.-]+\.(?:js|css|ttf)$/.test(name)
      || images.some(image => name === 'personagens/' + image);
    if (!allowed) throw Error(`Unexpected distribution file: ${name}`);
    const bytes = await readFile(path.join(directory, name));
    if (/\.(?:js|css|html)$/.test(name) && forbidden.test(bytes.toString('utf8'))) throw Error(`Forbidden reference in ${name}`);
    if (name.startsWith('personagens/')) {
      const original = await readFile(path.join(projectRoot, 'public', name));
      if (hash(original) !== hash(bytes)) throw Error(`Original image was altered: ${name}`);
    }
    entries.push({ path: name, bytes: bytes.length, sha256: hash(bytes) });
  }
  for (const required of ['index.html', 'licencas/Nunito-OFL.txt', 'licencas/DEPENDENCIAS.txt', ...images.map(image => 'personagens/' + image)]) {
    if (!files.includes(required)) throw Error(`Missing file: ${required}`);
  }
  for (const extension of ['js', 'css', 'ttf']) if (!files.some(name => name.endsWith('.' + extension))) throw Error(`Missing ${extension} asset`);
  const html = await readFile(path.join(directory, 'index.html'), 'utf8');
  for (const [, resource] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    if (!resource.startsWith('./assets/') || !files.includes(resource.slice(2))) throw Error(`Invalid entry resource: ${resource}`);
  }
  const css = (await Promise.all(files.filter(f => f.endsWith('.css')).map(f => readFile(path.join(directory, f), 'utf8')))).join('\n');
  if (!css.includes('@font-face') || !css.includes('Nunito')) throw Error('Local Nunito font missing');
  const fontName = files.find(f => f.endsWith('.ttf'));
  if (!css.includes(path.basename(fontName))) throw Error('Local font is not referenced by the stylesheet');
  if (hash(await readFile(path.join(directory, fontName))) !== hash(await readFile(path.join(projectRoot, 'src/assets/fonts/Nunito-Variable.ttf')))) throw Error('Font integrity mismatch');
  const inventory = { edition: 'Entre Nos - institucional estatica', generatedAt: new Date().toISOString(), files: entries,
    totalBytes: entries.reduce((sum, entry) => sum + entry.bytes, 0), externalConnections: ['Browser/OS speech synthesis may use remote voices', 'User-initiated sharing and email'] };
  return inventory;
}

// ZIP32 with stored entries: no platform tool, executable launcher or package dependency.
const crcTable = Array.from({ length: 256 }, (_, value) => {
  for (let i = 0; i < 8; i++) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  return value >>> 0;
});
export function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
export function makeZip(entries) {
  const local = [], central = []; let offset = 0;
  for (const { name, bytes } of entries) {
    if (name.startsWith('/') || name.split('/').includes('..') || name.includes('\\')) throw Error('Unsafe ZIP path');
    const filename = Buffer.from(name, 'utf8'), crc = crc32(bytes);
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50, 0); header.writeUInt16LE(20, 4); header.writeUInt16LE(0x800, 6);
    header.writeUInt16LE(33, 12); header.writeUInt32LE(crc, 14); header.writeUInt32LE(bytes.length, 18); header.writeUInt32LE(bytes.length, 22); header.writeUInt16LE(filename.length, 26);
    local.push(header, filename, bytes);
    const directory = Buffer.alloc(46);
    directory.writeUInt32LE(0x02014b50, 0); directory.writeUInt16LE(20, 4); directory.writeUInt16LE(20, 6); directory.writeUInt16LE(0x800, 8);
    directory.writeUInt16LE(33, 14); directory.writeUInt32LE(crc, 16); directory.writeUInt32LE(bytes.length, 20); directory.writeUInt32LE(bytes.length, 24); directory.writeUInt16LE(filename.length, 28); directory.writeUInt32LE(offset, 42);
    central.push(directory, filename); offset += header.length + filename.length + bytes.length;
    if (offset > 0xffffffff) throw Error('ZIP32 size exceeded');
  }
  if (entries.length > 65535) throw Error('ZIP32 entry count exceeded');
  const directory = Buffer.concat(central), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10); end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, directory, end]);
}

async function main(command) {
  const inventory = await verifySite();
  if (command === 'package') {
    await mkdir(outputRoot, { recursive: true });
    const inventoryBytes = Buffer.from(JSON.stringify(inventory, null, 2) + '\n');
    const instructions = await readFile(path.join(projectRoot, 'docs/hospedagem-institucional.md'));
    const entries = await Promise.all(inventory.files.map(async file => ({ name: 'site/' + file.path, bytes: await readFile(path.join(siteRoot, file.path)) })));
    entries.push({ name: 'inventario.json', bytes: inventoryBytes }, { name: 'INSTRUCOES.md', bytes: instructions });
    const zip = makeZip(entries);
    const filename = 'Entre-Nos-Institucional.zip';
    await writeFile(path.join(outputRoot, filename), zip);
    await writeFile(path.join(outputRoot, 'inventario.json'), inventoryBytes);
    await writeFile(path.join(outputRoot, filename + '.sha256'), hash(zip) + '  ' + filename + '\n');
    console.log(JSON.stringify({ zip: 'artifacts/institutional/' + filename, sha256: hash(zip), files: inventory.files.length, bytes: (await stat(path.join(outputRoot, filename))).size }));
  } else if (command === 'verify') console.log(JSON.stringify({ verified: true, files: inventory.files.length, bytes: inventory.totalBytes }));
  else throw Error('Use verify or package');
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main(process.argv[2]);
