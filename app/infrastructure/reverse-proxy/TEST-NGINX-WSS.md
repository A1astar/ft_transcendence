# Testing NGINX with WSS (WebSocket Secure)

This guide explains how to test your nginx reverse proxy with HTTPS and WebSocket Secure (WSS).

## Architecture

```
Browser (wss://localhost:8443)
    ↓
NGINX (Docker container, port 8443)
    ↓
Backend Services (host machine, ports 3000-3003)
```

## Prerequisites

1. **Frontend built**
   ```bash
   cd /home/hho-troc/Desktop/ft_transcendence/app/frontend
   npm run build
   ```

2. **Backend services running**
   ```bash
   cd /home/hho-troc/Desktop/ft_transcendence/app
   make local-watch
   ```

   Verify services are running:
   ```bash
   netstat -tlnp | grep -E "3000|3001|3002|3003"
   ```

   Should show:
   - Port 3000: gateway
   - Port 3001: authentication
   - Port 3002: game-orchestration
   - Port 3003: game-engine

## Method 1: Using server.js (Recommended for Local Testing)

**Pros:**
- ✅ Simple, no Docker needed
- ✅ Fast iteration
- ✅ Direct access to backend logs

**Steps:**

1. Start backend services:
   ```bash
   cd /home/hho-troc/Desktop/ft_transcendence/app
   make local-watch
   ```

2. Start HTTPS server with WSS proxy:
   ```bash
   cd /home/hho-troc/Desktop/ft_transcendence/app/frontend
   npm run serve
   ```

3. Open browser: `https://localhost:8443`

4. Accept self-signed certificate warning

5. Test game to verify WSS connection works

**How it works:**
- `server.js` provides HTTPS on port 8443
- Proxies WSS requests (`/api/game-engine/`) to `ws://localhost:3003`
- Browser sees `wss://localhost:8443/api/game-engine/...`

## Method 2: Using Docker + NGINX (Production-like)

**Pros:**
- ✅ Tests actual production configuration
- ✅ Matches docker-compose.yml setup

**Cons:**
- ❌ More complex setup
- ❌ Requires host.docker.internal configuration

### Option A: NGINX with Local Backend (Hybrid)

1. Build frontend:
   ```bash
   cd /home/hho-troc/Desktop/ft_transcendence/app/frontend
   npm run build
   ```

2. Start backend services on host:
   ```bash
   cd /home/hho-troc/Desktop/ft_transcendence/app
   make local-watch
   ```

3. Start NGINX container:
   ```bash
   cd /home/hho-troc/Desktop/ft_transcendence/app/build
   docker compose -f docker-compose.simple.yml up
   ```

4. Open browser: `https://localhost:8443`

**Configuration file used:** `nginx-local.conf`
- Uses `host.docker.internal` to reach host machine
- Proxies to `http://host.docker.internal:3003`

### Option B: Full Docker Deployment (All Services in Docker)

**Prerequisites:**
- All service Dockerfiles must build successfully
- TypeScript and dependencies configured correctly

1. Fix service dependencies (if not done):
   ```bash
   # Each service needs typescript in package.json
   # See earlier conversation for fixes
   ```

2. Start all services:
   ```bash
   cd /home/hho-troc/Desktop/ft_transcendence/app/build
   docker compose up --build
   ```

3. Open browser: `https://localhost:8443`

**Configuration file used:** `nginx.conf`
- Uses Docker network names (e.g., `game-engine:3003`)
- Services communicate within Docker network

## Troubleshooting

### WSS Connection Fails

**Check browser console:**
```javascript
// Should see:
WebSocket connection to 'wss://localhost:8443/api/game-engine/xxx'

// If error:
WebSocket connection to 'wss://...' failed: Error in connection establishment
```

**Solutions:**

1. **Verify backend is running:**
   ```bash
   curl http://localhost:3003/api/game-engine/health
   # or
   netstat -tlnp | grep 3003
   ```

2. **Check server.js logs:**
   ```
   🔄 Proxying WebSocket to game-engine: /api/game-engine/xxx
   ```

3. **Check NGINX logs (if using Docker):**
   ```bash
   docker logs $(docker ps -q --filter "ancestor=nginx:1.29.1-alpine-slim")
   ```

### Certificate Errors

**Error:** "Your connection is not private" (NET::ERR_CERT_AUTHORITY_INVALID)

**Solution:**
- Click "Advanced" → "Proceed to localhost (unsafe)"
- This is normal for self-signed certificates

### Port Already in Use

**Error:** `EADDRINUSE: address already in use 0.0.0.0:8443`

**Solution:**
```bash
# Find what's using the port
lsof -i :8443

# Kill it
kill -9 <PID>
```

### NGINX Can't Reach Backend

**Error in NGINX logs:** `connect() failed (111: Connection refused)`

**Solutions:**

1. **If using docker-compose.simple.yml:**
   - Check `host.docker.internal` is configured:
     ```yaml
     extra_hosts:
       - "host.docker.internal:host-gateway"
     ```

2. **If using full docker-compose.yml:**
   - Backend services must be in same Docker network
   - Check service names match in nginx.conf

## Verification Checklist

- [ ] Frontend builds successfully (`npm run build`)
- [ ] Backend services start (`make local-watch`)
- [ ] Can access `https://localhost:8443` in browser
- [ ] Can navigate to `/login`, `/settings` (SPA routing works)
- [ ] Game starts and WebSocket connects
- [ ] Browser console shows `wss://` connection (not `ws://`)
- [ ] No mixed content warnings in console

## Files Overview

| File | Purpose | Used When |
|------|---------|-----------|
| `server.js` | HTTPS server with WSS proxy | Local testing (Method 1) |
| `nginx.conf` | NGINX config for Docker network | Full Docker deployment |
| `nginx-local.conf` | NGINX config for host backend | Hybrid Docker setup |
| `docker-compose.simple.yml` | NGINX only, backend on host | Testing NGINX locally |
| `docker-compose.yml` | All services in Docker | Production deployment |

## Current Recommendation

**For testing HTTPS/WSS functionality:**

Use **Method 1 (server.js)** because:
- ✅ Simplest setup
- ✅ Fastest iteration
- ✅ Meets HTTPS/WSS requirements
- ✅ Easy debugging

```bash
# Terminal 1: Backend
cd /home/hho-troc/Desktop/ft_transcendence/app
make local-watch

# Terminal 2: Frontend HTTPS server
cd /home/hho-troc/Desktop/ft_transcendence/app/frontend
npm run serve

# Browser: https://localhost:8443
```

**For production deployment:**

Use **Method 2B (Full Docker)** when ready to deploy everything in containers.
