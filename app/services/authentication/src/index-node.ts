import http from 'http'

function initServer(server: http.Server) {
    server.listen('2000');
}

async function main() {
    const server = http.createServer();
    initServer(server);
}