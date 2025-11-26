# server.js - HTTPS Server with WebSocket Proxy

## What is server.js?

`server.js` is a **custom Node.js HTTPS server** that serves your frontend application and proxies WebSocket connections to backend services.

It combines three functionalities:
1. **HTTPS Static File Server** - Serves HTML, CSS, JS, images, etc.
2. **SPA Router** - Handles client-side routing for Single Page Applications
3. **WebSocket Proxy** - Forwards secure WebSocket connections to backend services

## Why Do We Need It?

### Problem 1: HTTPS Requirement

The project requires all connections to use HTTPS/WSS (WebSocket Secure):
> "If you have a backend or any other features, it is mandatory to enable an HTTPS connection for all aspects (use wss instead of ws for example)."

**Without server.js:**
- ❌ Frontend runs on `http://localhost` (insecure)
- ❌ WebSocket uses `ws://` (insecure)
- ❌ Doesn't meet project requirements

**With server.js:**
- ✅ Frontend runs on `https://localhost:8443` (secure)
- ✅ WebSocket uses `wss://` (secure)
- ✅ Meets HTTPS requirements

### Problem 2: Mixed Content Blocking

Modern browsers block insecure requests from secure pages:

```
https://localhost:8443 (secure page)
    ↓
ws://localhost:3003 (insecure WebSocket)
    ↓
❌ BLOCKED! "Mixed Content"
```

**server.js solves this:**
```
Browser: wss://localhost:8443/api/game-engine/match123
    ↓ (secure connection)
server.js: Receives secure WSS request
    ↓ (proxies to backend)
Backend: ws://localhost:3003/api/game-engine/match123
    ↓ (local connection, not exposed to internet)
✅ WORKS!
```

The browser only sees secure `wss://`, backend can use plain `ws://` locally.

### Problem 3: SPA Routing

Single Page Applications (like yours) use client-side routing:
- `/` → home page
- `/login` → login page
- `/game` → game page

These routes don't exist as actual files on the server!

**Without SPA support:**
```bash
curl https://localhost:8443/login
❌ 404 Not Found (no file called "login")
```

**With server.js:**
```bash
curl https://localhost:8443/login
✅ 200 OK (returns index.html, React Router handles /login)
```

## How It Works

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser                               │
│  https://localhost:8443                                  │
│  wss://localhost:8443/api/game-engine/match123          │
└─────────────────┬───────────────────────────────────────┘
                  │ (HTTPS/WSS - Secure)
                  ↓
┌─────────────────────────────────────────────────────────┐
│              server.js (Port 8443)                       │
│                                                          │
│  ┌──────────────────────────────────────────────┐      │
│  │ 1. HTTPS Handler                              │      │
│  │    - Serves static files (HTML, CSS, JS)     │      │
│  │    - SPA routing (returns index.html)        │      │
│  └──────────────────────────────────────────────┘      │
│                                                          │
│  ┌──────────────────────────────────────────────┐      │
│  │ 2. WebSocket Proxy Handler                   │      │
│  │    - Intercepts WSS upgrade requests         │      │
│  │    - Proxies to backend                      │      │
│  └──────────────────────────────────────────────┘      │
└─────────────────┬───────────────────────────────────────┘
                  │ (WS - Plain, local only)
                  ↓
┌─────────────────────────────────────────────────────────┐
│           Backend Services (localhost)                   │
│  - game-engine:    ws://localhost:3003                  │
│  - gateway:        http://localhost:3000                │
│  - authentication: http://localhost:3001                │
└─────────────────────────────────────────────────────────┘
```

### Code Breakdown

#### 1. Import Dependencies

```javascript
import https from 'https';  // HTTPS server
import http from 'http';    // For backend connections
import fs from 'fs';        // File system operations
import path from 'path';    // Path utilities
```

#### 2. Load SSL Certificates

```javascript
const options = {
    key: fs.readFileSync(path.join(__dirname, 'certs/self.key')),
    cert: fs.readFileSync(path.join(__dirname, 'certs/self.crt'))
};
```

These self-signed certificates enable HTTPS:
- `self.key` - Private key
- `self.crt` - Public certificate

#### 3. HTTPS Request Handler

```javascript
const server = https.createServer(options, (req, res) => {
    // Serves files or index.html for SPA routes
});
```

**Flow:**

1. **Request comes in:** `GET /login`

2. **Try to find file:** `/path/to/frontend/login`

3. **File doesn't exist?** 
   - Check if it has an extension (`.js`, `.css`, `.png`)
   - If yes → 404 (missing asset)
   - If no → Return `index.html` (SPA route)

4. **Send response** with correct MIME type

#### 4. WebSocket Proxy Handler

```javascript
server.on('upgrade', proxyWebSocket);
```

**WebSocket Upgrade Flow:**

1. **Browser sends:** 
   ```
   GET /api/game-engine/match123 HTTP/1.1
   Upgrade: websocket
   Connection: Upgrade
   ```

2. **server.js receives upgrade request**

3. **Creates connection to backend:**
   ```javascript
   http.request({
       hostname: 'localhost',
       port: 3003,
       path: '/api/game-engine/match123',
       headers: req.headers  // Forward original headers
   })
   ```

4. **Backend responds with upgrade**

5. **server.js pipes data:**
   ```javascript
   backendSocket.pipe(browserSocket);  // Backend → Browser
   browserSocket.pipe(backendSocket);  // Browser → Backend
   ```

6. **Result:** Bidirectional WebSocket tunnel

#### 5. Start Server

```javascript
server.listen(8443, () => {
    console.log('🚀 HTTPS Server running at https://localhost:8443');
});
```

## Request Examples

### Static File Request

```
Browser → GET https://localhost:8443/dist/main.js

server.js:
  1. Find file: /frontend/dist/main.js ✓
  2. Read file content
  3. Set Content-Type: text/javascript
  4. Send response

Browser ← 200 OK (JavaScript content)
```

### SPA Route Request

```
Browser → GET https://localhost:8443/login

server.js:
  1. Find file: /frontend/login ✗ (not found)
  2. Check extension: none
  3. Return: /frontend/index.html
  4. Set Content-Type: text/html

Browser ← 200 OK (index.html)
Browser: React Router sees /login and renders LoginView
```

### WebSocket Request

```
Browser → WSS Upgrade: wss://localhost:8443/api/game-engine/match123

server.js:
  1. Detect 'upgrade' event
  2. Check path: /api/game-engine/ ✓
  3. Connect to: ws://localhost:3003/api/game-engine/match123
  4. Pipe data bidirectionally

Backend ↔ server.js ↔ Browser
```

## Benefits vs. Alternatives

### vs. Using nginx (Docker)

| Feature | server.js | nginx (Docker) |
|---------|-----------|----------------|
| Setup complexity | Simple | Complex (Docker, config) |
| Development speed | Fast | Slow (rebuild containers) |
| Production ready | No | Yes |
| Hot reload | Yes | No |
| Debugging | Easy | Hard (container logs) |

**Use server.js for:** Local development, testing HTTPS
**Use nginx for:** Production deployment

### vs. Direct Connection

```javascript
// Without server.js
const ws = new WebSocket('ws://localhost:3003/...');
❌ Not secure, doesn't meet requirements

// With server.js
const ws = new WebSocket('wss://localhost:8443/api/game-engine/...');
✅ Secure, meets requirements
```

## Configuration

### Port

Change the port in the last line:
```javascript
server.listen(8443, () => {  // Change 8443 to desired port
```

### Backend Proxy Targets

Modify `proxyWebSocket` function:
```javascript
if (url.pathname.startsWith('/api/game-engine/')) {
    // Proxy to different backend
    const backendReq = http.request({
        hostname: 'localhost',
        port: 3003,  // Change port here
        // ...
    });
}
```

### SSL Certificates

Replace self-signed certificates:
```javascript
const options = {
    key: fs.readFileSync('path/to/your.key'),
    cert: fs.readFileSync('path/to/your.crt')
};
```

## Common Issues

### Certificate Warnings

**Issue:** Browser shows "Your connection is not private"

**Cause:** Self-signed certificate not trusted

**Solution:** Click "Advanced" → "Proceed to localhost"

**For production:** Use real certificates (Let's Encrypt)

### WebSocket Connection Fails

**Issue:** WSS connection refused

**Causes:**
1. Backend service not running
   ```bash
   netstat -tlnp | grep 3003  # Check if listening
   ```

2. Wrong backend port in `proxyWebSocket`

3. Backend doesn't handle WebSocket upgrades

**Debug:**
```javascript
// Add logging in proxyWebSocket
console.log('Proxying to:', url.pathname);
backendReq.on('error', (err) => {
    console.error('Backend error:', err);
});
```

### MIME Type Errors

**Issue:** JavaScript files load as `text/html`

**Cause:** Missing MIME type mapping

**Solution:** Add to `mimeTypes` object:
```javascript
const mimeTypes = {
    '.js': 'text/javascript',
    '.mjs': 'text/javascript',  // Add new types
    // ...
};
```

## Running server.js

### Development

```bash
# Terminal 1: Start backend services
cd /home/hho-troc/Desktop/ft_transcendence/app
make local-watch

# Terminal 2: Start HTTPS server
cd /home/hho-troc/Desktop/ft_transcendence/app/frontend
npm run serve  # Runs: node server.js
```

### Standalone

```bash
node server.js
```

### With nodemon (auto-restart)

```bash
npm install -g nodemon
nodemon server.js
```

## Summary

**server.js is needed because:**
1. ✅ Provides HTTPS (meets security requirements)
2. ✅ Proxies WSS to backend WS (avoids mixed content)
3. ✅ Handles SPA routing (client-side navigation)
4. ✅ Simple development setup (no Docker needed)
5. ✅ Fast iteration (instant changes)

**It replaces nginx for local development** while maintaining the same security guarantees.

**For production:** Use nginx in Docker (docker-compose.yml), but server.js proves the architecture works and lets you develop faster.
