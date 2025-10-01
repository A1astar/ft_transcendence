import Fastify from "fastify";
import cors from "@fastify/cors";

// Start server
async function start() {
    const fastify = Fastify({ logger: true });
    // Enable CORS (allow connections from frontend or other services)
    fastify.register(cors, {
        origin: "*"
    });
    fastify.post("/game-engine/start", async (request, reply) => {
        console.log(request.body);
        return request.body;
    });
    try {
        await fastify.listen({ port: 3002, host: "0.0.0.0" });
        console.log("User Service running on port 3002");
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
