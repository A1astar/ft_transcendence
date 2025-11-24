import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import webSocket from "@fastify/websocket";
import fastifyJWT from "@fastify/jwt";
import crypto from "crypto";
import { games, gameConnections } from "./objects.js";
import { initGame } from "./initGame.js";
import { handleWebSocket } from "./handleWebSocket.js";
import { apiRoutes } from "./cliApis.js";
import chalk from 'chalk';


// Start server
async function start() {

  const fastify = Fastify({ logger: true });

  fastify.register(cors, {origin: "*"});
  fastify.register(webSocket);

  // Initialize JWT (must match the authentication service secret)
  const jwtSecret = process.env['JWT_SECRET'] || crypto.randomBytes(32).toString('hex');
  fastify.register(fastifyJWT, {
    secret: jwtSecret,
    sign: {
      expiresIn: '15m', // Access token expires in 15 minutes
    },
  });

  // Unified error handling
  fastify.setErrorHandler((error: any, request, reply) => {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    
    fastify.log.error({
      err: error,
      url: request.url,
      method: request.method,
      statusCode
    });

    reply.status(statusCode).send({
      status: "error",
      error: message,
      statusCode: statusCode,
      timestamp: new Date().toISOString()
    });
  });

  // 404 handler
  fastify.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      status: "error",
      error: "Route not found",
      statusCode: 404,
      path: request.url,
      timestamp: new Date().toISOString()
    });
  });

  initGame(fastify, games, gameConnections);
  handleWebSocket(fastify, games, gameConnections);
  apiRoutes(fastify, games, gameConnections);

  try {
    await fastify.listen({ port: 3003, host: "0.0.0.0" });
    console.log(chalk.green.bold("Game Engine Service running on port 3003"));
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
