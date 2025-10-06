import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import webSocket from "@fastify/websocket";
import { Game } from "./objects.js";
import { initGame } from "./initGame.js";
import { handleWebSocket } from "./handleWebSocket.js";

const games = new Map<string, Game>();
const gameConnections = new Map<string, Set<any>>();

// Start server
const start = async () => {
  
  const fastify = Fastify({ logger: true });

  // Enable CORS (allow connections from frontend or other services)
  fastify.register(cors, {origin: "*"});
  fastify.register(webSocket);

  initGame(fastify, games, gameConnections);
  handleWebSocket(fastify, games, gameConnections);

  try {
    await fastify.listen({ port: 3003, host: "0.0.0.0" });
    console.log("Game Engine Service running on port 3003");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
