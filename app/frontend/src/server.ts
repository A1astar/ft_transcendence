import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { Duplex } from 'stream';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base dir should be the frontend root (one level above dist/src)
const BASE_DIR = path.resolve(__dirname, '..');

type MimeMap = Record<string, string>;

const mimeTypes: MimeMap = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

function readCertPair(): { key: Buffer; cert: Buffer } {
  const candidates = [
    { key: 'server.key', crt: 'server.crt' },
    { key: 'self.key', crt: 'self.crt' }
  ];
  for (const c of candidates) {
    const keyPath = path.join(BASE_DIR, 'certs', c.key);
    const crtPath = path.join(BASE_DIR, 'certs', c.crt);
    if (fs.existsSync(keyPath) && fs.existsSync(crtPath)) {
      return {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(crtPath)
      };
    }
  }
  throw new Error('No TLS certs found in certs/. Expected server.key/server.crt or self.key/self.crt');
}

const API_ORIGIN = process.env.API_ORIGIN || 'http://localhost:3000';
const API_URL = new URL(API_ORIGIN);

function proxyHttpRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
  const upstreamPath = (req.url || '/').replace(/^\/api/, '');
  const options: https.RequestOptions & http.RequestOptions = {
    protocol: API_URL.protocol,
    hostname: API_URL.hostname,
    port: API_URL.port || (API_URL.protocol === 'https:' ? 443 : 80),
    path: upstreamPath,
    method: req.method || 'GET',
    headers: req.headers
  };

  const client = API_URL.protocol === 'https:' ? https : http;
  const upstreamReq = client.request(options, (upstreamRes) => {
    res.writeHead(upstreamRes.statusCode || 500, upstreamRes.headers);
    upstreamRes.pipe(res);
  });

  upstreamReq.on('error', (err: Error) => {
    console.error('HTTP proxy error:', err.message);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Bad Gateway', details: err.message }));
  });

  req.pipe(upstreamReq);
}

function proxyWebSocket(req: http.IncomingMessage, socket: Duplex, head: Buffer, isSecure: boolean): void {
  const reqUrl = req.url || '/';
  const host = req.headers.host || 'localhost';
  const scheme = isSecure ? 'wss' : 'ws';
  const urlObj = new URL(reqUrl, `${scheme}://${host}`);

  if (urlObj.pathname.startsWith('/api/game-engine/')) {
    console.log('🔄 Proxying WebSocket to game-engine:', urlObj.pathname);

    const backendReq = http.request({
      hostname: 'localhost',
      port: 3003,
      path: reqUrl.replace(/^\/api/, ''),
      method: req.method || 'GET',
      headers: req.headers
    });

    backendReq.on('upgrade', (backendRes, backendSocket, backendHead) => {
      const acceptHeader = backendRes.headers['sec-websocket-accept'];
      const accept = Array.isArray(acceptHeader) ? acceptHeader[0] : (acceptHeader ?? '');

      socket.write(
        'HTTP/1.1 101 Switching Protocols\r\n' +
        'Upgrade: websocket\r\n' +
        'Connection: Upgrade\r\n' +
        `Sec-WebSocket-Accept: ${accept}\r\n` +
        '\r\n'
      );

      backendSocket.pipe(socket);
      socket.pipe(backendSocket);
    });

    backendReq.on('error', (err: Error) => {
      console.error('WebSocket proxy error:', err.message);
      socket.destroy();
    });

    backendReq.end();
  } else {
    socket.destroy();
  }
}

const FORCE_HTTP = process.env.HTTP_ONLY === '1';
let isHttps = false;

function requestHandler(req: http.IncomingMessage, res: http.ServerResponse): void {
  const urlPath = req.url || '/';

  if (urlPath.startsWith('/api')) {
    proxyHttpRequest(req, res);
    return;
  }

  // Serve files from BASE_DIR (frontend root)
  let filePath = path.join(BASE_DIR, urlPath === '/' ? 'index.html' : urlPath);

  fs.stat(filePath, (err: NodeJS.ErrnoException | null, stats?: fs.Stats) => {
    let serveFile = filePath;

    if (err || (stats && stats.isDirectory())) {
      const ext = path.extname(urlPath);

      if (ext && ext !== '.html') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 - File Not Found');
        return;
      }

      serveFile = path.join(BASE_DIR, 'index.html');
    }

    fs.readFile(serveFile, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 - Internal Server Error');
        return;
      }

      const ext = path.extname(serveFile);
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
}

let server: https.Server | http.Server;

if (!FORCE_HTTP) {
  try {
    const options = readCertPair();
    isHttps = true;
    server = https.createServer(options, requestHandler);
  } catch (e) {
    console.warn('TLS certs not found, falling back to HTTP. Set HTTP_ONLY=1 to silence this notice.');
    isHttps = false;
    server = http.createServer(requestHandler);
  }
} else {
  console.log('HTTP_ONLY=1 set. Starting HTTP server without TLS.');
  isHttps = false;
  server = http.createServer(requestHandler);
}

server.on('upgrade', (req, socket, head) => proxyWebSocket(req, socket, head, isHttps));

const PORT = Number(process.env.PORT || 8443);
server.listen(PORT, () => {
  const proto = isHttps ? 'https' : 'http';
  console.log(`${proto.toUpperCase()} Server running at ${proto}://localhost:${PORT}`);
  console.log('Proxying REST under /api →', API_ORIGIN);
  console.log('WebSocket proxy enabled for /api/game-engine/');
  console.log('Serving files from:', BASE_DIR);
});
