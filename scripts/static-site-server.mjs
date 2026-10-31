// Test fixture only. Not shipped inside the institutional website or ZIP.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.webp': 'image/webp', '.ttf': 'font/ttf', '.txt': 'text/plain; charset=utf-8' };
export async function staticSiteServer(directory, port = 0) {
  const requests = [];
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    requests.push({ method: req.method, path: url.pathname });
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
    if (url.pathname === '/entre-nos') { res.writeHead(308, { Location: '/entre-nos/' }).end(); return; }
    let relative;
    try { relative = decodeURIComponent(url.pathname.replace(/^\/entre-nos\//, '/')).replace(/^\//, ''); }
    catch { res.writeHead(400).end(); return; }
    if (!relative) relative = 'index.html';
    if (relative.split('/').some(part => part.startsWith('.') || part === 'api') || relative.includes('\\')) { res.writeHead(404).end(); return; }
    const filename = path.resolve(directory, relative);
    if (!filename.startsWith(path.resolve(directory) + path.sep)) { res.writeHead(404).end(); return; }
    try {
      if (!(await stat(filename)).isFile() || !mime[path.extname(filename)]) throw Error();
      const bytes = await readFile(filename);
      res.writeHead(200, { 'Content-Type': mime[path.extname(filename)], 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
      res.end(req.method === 'HEAD' ? undefined : bytes);
    } catch { res.writeHead(404).end(); }
  });
  await new Promise(resolve => server.listen(port, '127.0.0.1', resolve));
  return { origin: `http://127.0.0.1:${server.address().port}`, requests, close: () => new Promise(resolve => server.close(resolve)) };
}
