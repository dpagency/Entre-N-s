import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { assetUrl, applicationUrl, INSTITUTIONAL } from '../src/distribution';
import { crc32, makeZip, verifySite } from '../scripts/institutional-package.mjs';

test('asset resolution preserves the current edition and supports a portable subfolder', () => {
  assert.equal(INSTITUTIONAL, false);
  assert.equal(assetUrl('/personagens/rin.png'), '/personagens/rin.png');
  assert.equal(assetUrl('/personagens/rin.png', './'), './personagens/rin.png');
  assert.equal(assetUrl('/personagens/rin.png', '/entre-nos/'), '/entre-nos/personagens/rin.png');
  assert.equal(applicationUrl({ href: 'https://example.test/entre-nos/index.html?x=1' }, './'), 'https://example.test/entre-nos/');
  assert.equal(applicationUrl({ href: 'https://example.test/entre-nos/' }, '/'), 'https://example.test/');
});

test('distribution validation rejects old APIs, external fonts and unexpected server files', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'entre-nos-package-test-'));
  try {
    for (const marker of ['/api/game', '/api/admin/metrics', 'fonts.googleapis.com', 'UPSTASH_REDIS_REST_TOKEN']) {
      await writeFile(path.join(root, 'index.html'), marker);
      await assert.rejects(verifySite(root), /Forbidden reference/);
    }
    await mkdir(path.join(root, 'api'));
    await writeFile(path.join(root, 'api/game.ts'), 'not allowed');
    await assert.rejects(verifySite(root), /Unexpected distribution file/);
  } finally {
    assert(path.resolve(root).startsWith(path.resolve(os.tmpdir()) + path.sep));
    await rm(root, { recursive: true, force: true });
  }
});

test('the portable ZIP uses valid CRC32 and rejects path traversal', () => {
  assert.equal(crc32(Buffer.from('123456789')), 0xcbf43926);
  const zip = makeZip([{ name: 'site/index.html', bytes: Buffer.from('test') }]);
  assert.equal(zip.readUInt32LE(0), 0x04034b50);
  assert.equal(zip.readUInt32LE(zip.length - 22), 0x06054b50);
  assert.equal(zip.readUInt16LE(zip.length - 12), 1);
  assert.throws(() => makeZip([{ name: '../outside', bytes: Buffer.from('bad') }]), /Unsafe ZIP path/);
});
