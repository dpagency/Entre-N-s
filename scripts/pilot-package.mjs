import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { projectRoot, verifySite, makeZip } from './institutional-package.mjs';

const site = path.join(projectRoot, 'dist-piloto');
const output = path.join(projectRoot, 'artifacts/piloto-duas-jornadas');
const inventory = await verifySite(site);
inventory.edition = 'Entre Nos - piloto estatico com duas jornadas';
const entries = await Promise.all(inventory.files.map(async file => ({ name: file.path, bytes: await readFile(path.join(site, file.path)) })));
const zip = makeZip(entries);
await mkdir(output, { recursive: true });
await writeFile(path.join(output, 'entre-nos-duas-jornadas.zip'), zip);
await writeFile(path.join(output, 'inventario.json'), JSON.stringify(inventory, null, 2) + '\n');
await writeFile(path.join(output, 'entre-nos-duas-jornadas.zip.sha256'), createHash('sha256').update(zip).digest('hex') + '  entre-nos-duas-jornadas.zip\n');
console.log(JSON.stringify({ directory: output, files: inventory.files.length, sha256: createHash('sha256').update(zip).digest('hex') }));
