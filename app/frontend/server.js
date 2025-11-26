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

// WebSocket proxy handler
function proxyWebSocket(req, socket, head) {
    const url = new URL(req.url, `wss://${req.headers.host}`);

    // Check if it's a WebSocket upgrade for game-engine
    if (url.pathname.startsWith('/api/game-engine/')) {
        console.log('🔄 Proxying WebSocket to game-engine:', url.pathname);

        // Create connection to backend
        const backendReq = http.request({
            hostname: 'localhost',
            port: 3003,
            path: req.url,
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
const options = {
    key: fs.readFileSync(path.join(__dirname, 'certs/self.key')),
    cert: fs.readFileSync(path.join(__dirname, 'certs/self.crt'))
};

const server = https.createServer(options, (req, res) => {
    // 2. Determine what file the user wants
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);

    // 3. Check if the file exists
    fs.stat(filePath, (err, stats) => {
        let serveFile = filePath;

        // 4. THE MAGIC FIX: If file is missing (err) OR it's a directory...
        if (err || (stats && stats.isDirectory())) {
            const ext = path.extname(req.url);

            // If it looks like a missing image/script (has extension), send real 404
            if (ext && ext !== '.html') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 - File Not Found');
                return;
            }

            // Otherwise (like /login, /settings), serve index.html!
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
    console.log('🔌 WebSocket proxy enabled for /api/game-engine/');
    console.log('📁 Serving files from:', __dirname);
});
