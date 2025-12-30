import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MIME types for different file extensions
const mimeTypes = {
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

// Resolve cert pair: prefer mkcert files, fallback to self-signed
function readCertPair() {
    const candidates = [
        { key: 'server.key', crt: 'server.crt' },
        { key: 'self.key', crt: 'self.crt' }
    ];
    for (const c of candidates) {
        const keyPath = path.join(__dirname, 'certs', c.key);
        const crtPath = path.join(__dirname, 'certs', c.crt);
        if (fs.existsSync(keyPath) && fs.existsSync(crtPath)) {
            return {
                key: fs.readFileSync(keyPath),
                cert: fs.readFileSync(crtPath)
            };
        }
    }
    throw new Error('No TLS certs found in certs/. Expected server.key/server.crt or self.key/self.crt');
}

// Simple HTTP proxy for REST APIs under /api/* to a local backend
const API_ORIGIN = process.env.API_ORIGIN || 'http://localhost:3000';
const API_URL = new URL(API_ORIGIN);

function proxyHttpRequest(req, res) {
    console.log(req.head);
    const upstreamPath = req.url.replace(/^\/api/, '');
    const options = {
        protocol: API_URL.protocol,
        hostname: API_URL.hostname,
        port: API_URL.port || (API_URL.protocol === 'https:' ? 443 : 80),
        path: upstreamPath,
        method: req.method,
        headers: req.headers
    };

    const client = API_URL.protocol === 'https:' ? https : http;
    const upstreamReq = client.request(options, (upstreamRes) => {
        // passthrough status and headers
        res.writeHead(upstreamRes.statusCode || 500, upstreamRes.headers);
        upstreamRes.pipe(res);
    });

    upstreamReq.on('error', (err) => {
        console.error('❌ HTTP proxy error:', err.message);
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Bad Gateway', details: err.message }));
    });

    // stream request body
    req.pipe(upstreamReq);
}

// WebSocket proxy handler (game-engine)
function proxyWebSocket(req, socket, head) {
    const url = new URL(req.url, `wss://${req.headers.host}`);

    // Proxy WebSocket for game-engine
    if (url.pathname.startsWith('/api/game-engine/')) {
        console.log('🔄 Proxying WebSocket to game-engine:', url.pathname);

        const backendReq = http.request({
            hostname: 'localhost',
            port: 3003,
            path: req.url.replace(/^\/api/, ''),
            method: req.method,
            headers: req.headers
        });

        backendReq.on('upgrade', (backendRes, backendSocket, backendHead) => {
            socket.write('HTTP/1.1 101 Switching Protocols\r\n' +
                        'Upgrade: websocket\r\n' +
                        'Connection: Upgrade\r\n' +
                        `Sec-WebSocket-Accept: ${backendRes.headers['sec-websocket-accept']}\r\n` +
                        '\r\n');

            backendSocket.pipe(socket);
            socket.pipe(backendSocket);
        });

        backendReq.on('error', (err) => {
            console.error('❌ WebSocket proxy error:', err.message);
            socket.destroy();
        });

        backendReq.end();
    } else {
        socket.destroy();
    }
}

// 1. Setup HTTPS with your certs
const options = readCertPair();

const server = https.createServer(options, (req, res) => {

    // Proxy API calls first
    if (req.url.startsWith('/api')) {
        return proxyHttpRequest(req, res);
    }

    // 2. Determine what file the user wants
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);

    // 3. Check if the file exists
    fs.stat(filePath, (err, stats) => {
        let serveFile = filePath;

        // 4. SPA fallback: missing file or directory → index.html
        if (err || (stats && stats.isDirectory())) {
            const ext = path.extname(req.url);

            // If it looks like a missing asset (has extension), send real 404
            if (ext && ext !== '.html') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 - File Not Found');
                return;
            }

            // Otherwise (like /login, /settings), serve index.html
            serveFile = path.join(__dirname, 'index.html');
        }

        // 5. Send the file content
        fs.readFile(serveFile, (err, content) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 - Internal Server Error');
                return;
            }

            // Get the correct MIME type
            const ext = path.extname(serveFile);
            const contentType = mimeTypes[ext] || 'application/octet-stream';

            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        });
    });
});

// Handle WebSocket upgrades
server.on('upgrade', proxyWebSocket);

server.listen(8443, () => {
    console.log('🚀 HTTPS Server running at https://localhost:8443');
    console.log('🔌 Proxying REST under /api →', API_ORIGIN);
    console.log('🔌 WebSocket proxy enabled for /api/game-engine/');
    console.log('📁 Serving files from:', __dirname);
});
