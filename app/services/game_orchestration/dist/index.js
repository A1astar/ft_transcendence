import Fastify from "fastify";
import cors from "@fastify/cors";
const fastify = Fastify({ logger: true });
// Enable CORS (allow connections from frontend or other services)
fastify.register(cors, {
    origin: "*"
});
// Minimal route
fastify.get("/health", async (request, reply) => {
    return { status: "ok", service: "user-service" };
});
// Example user endpoint (dummy)
fastify.get("/users/:id", async (request, reply) => {
    const { id } = request.params;
    return { id, username: "player" + id };
});
// Start server
const start = async () => {
    try {
        await fastify.listen({ port: 3001, host: "0.0.0.0" });
        console.log("User Service running on port 3001");
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
