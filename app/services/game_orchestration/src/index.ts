import Fastify from "fastify";
import cors from "@fastify/cors";
import { randomUUID } from "crypto";
import { Player, Match, queues } from "./objects.js";

const fastify = Fastify({ logger: true });

// Enable CORS (allow connections from frontend or other services)
fastify.register(cors, {
  origin: "*"
});

fastify.post("/matchmaking/local", async(request, reply) => {
  const player = request.body as Player;
  queues.local.push(player);

  if (queues.local.length == 2) {
    const matchPlayers = queues.local.splice(0,2);
    const match: Match = {
      id: randomUUID(),
      players: matchPlayers,
      mode: "local",
      tournament_id: 0,
      status: "running"
    };
    return match;
  }
  return {status: "waiting"};
})

fastify.post("/matchmaking/remote", async(request, reply) => {
  const player = request.body as Player;
  queues.remote.push(player);

  if (queues.remote.length == 2) {
    const matchPlayers = queues.remote.splice(0,2);
    const match: Match = {
      id: randomUUID(),
      players: matchPlayers,
      mode: "remote",
      tournament_id: 0,
      status: "running"
    };
    return match;
  }
  return {status: "waiting"};
})

// todo
fastify.post("/matchmaking/tournament", async(request, reply) => {
  const player = request.body as Player;
  queues.tournament.push(player);

  if (queues.tournament.length == 4) {

    const matchPlayers1 = queues.tournament.splice(0,2);
    const match1: Match = {
      id: randomUUID(),
      players: matchPlayers1,
      mode: "tournament",
      tournament_id: 1,
      status: "running"
    };
    const matchPlayers2 = queues.tournament.splice(0,2);
    const match2: Match = {
      id: randomUUID(),
      players: matchPlayers2,
      mode: "tournament",
      tournament_id: 2,
      status: "running"
    };
    return match1;
  }
  return {status: "waiting"};
})


// Example user endpoint (dummy)
fastify.get("/users/:id", async (request, reply) => {
  const { id } = request.params as { id: string };
  return { id, username: "player" + id };
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: "0.0.0.0" });
    console.log("User Service running on port 3001");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
