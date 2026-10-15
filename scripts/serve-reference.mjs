import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname } from 'node:path';

const args = process.argv.slice(2);
const option = name => args[args.indexOf(name) + 1];
const fileArg = args.includes('--file') ? option('--file') : undefined;
const portArg = args.includes('--port') ? option('--port') : '4175';
const port = Number(portArg);

if (!fileArg || !Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('Usage: npm run view:reference -- --file "C:\\path\\clip.mp4" [--port 4175]');
  process.exit(1);
}

let file;
let info;
try {
  file = await realpath(fileArg);
  info = await stat(file);
} catch {
  console.error('Reference file not found or cannot be read.');
  process.exit(1);
}
if (!info.isFile() || extname(file).toLowerCase() !== '.mp4') {
  console.error('The reference must be an existing MP4 file.');
  process.exit(1);
}

const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Local reference video</title><style>html,body{margin:0;min-height:100%;background:#111;color:white;font:16px system-ui}main{display:grid;min-height:100vh;place-items:center;padding:24px;box-sizing:border-box}video{display:block;max-width:100%;max-height:calc(100vh - 48px)}</style><main><video aria-label="Local reference video" controls playsinline preload="metadata" src="/reference.mp4"></video></main></html>`;

const server = createServer((request, response) => {
  if (request.url === '/' && ['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Content-Security-Policy': "default-src 'none'; media-src 'self'; style-src 'unsafe-inline'", 'X-Content-Type-Options': 'nosniff' });
    response.end(request.method === 'HEAD' ? undefined : html);
    return;
  }
  if (request.url !== '/reference.mp4' || !['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(404).end();
    return;
  }

  const range = request.headers.range?.match(/^bytes=(\d*)-(\d*)$/);
  let start = 0;
  let end = info.size - 1;
  if (request.headers.range && !range) {
    response.writeHead(416, { 'Content-Range': `bytes */${info.size}` }).end();
    return;
  }
  if (range) {
    if (range[1]) start = Number(range[1]);
    if (range[2]) end = Number(range[2]);
    if (!range[1] && range[2]) start = Math.max(0, info.size - Number(range[2]));
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= info.size) {
      response.writeHead(416, { 'Content-Range': `bytes */${info.size}` }).end();
      return;
    }
    end = Math.min(end, info.size - 1);
  }

  response.writeHead(range ? 206 : 200, {
    'Content-Type': 'video/mp4',
    'Content-Length': end - start + 1,
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...(range ? { 'Content-Range': `bytes ${start}-${end}/${info.size}` } : {}),
  });
  if (request.method === 'HEAD') { response.end(); return; }
  const stream = createReadStream(file, { start, end }).on('error', () => response.destroy());
  response.on('close', () => stream.destroy());
  stream.pipe(response);
});

server.listen(port, '127.0.0.1', () => console.log(`Local reference viewer: http://127.0.0.1:${port}/`));
